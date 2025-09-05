/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/naming-convention */
import { Box, Button } from '@mui/joy';
import { useDeliveries } from 'query/deliveries';
import { useSearchTrades } from 'query/trade';
import { useTspLocations } from 'query/tsp';
import { IDelivery, QueryFactoryParams, QueryOperator } from '@naesb/dlt-model';
import { ColDef } from 'ag-grid-community';
import { eachDayOfInterval, endOfDay } from 'date-fns';
import { get, keyBy, set } from 'lodash';
import {
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';
import {
  dateFormatter,
  numberFormatter,
} from 'components/shared/table/formatters';
import { useOrgMsp } from 'utils/auth';
import { useBusiness } from 'query/directory';
import { useNavigate, useParams, useSearch } from '@tanstack/router';
import { BaseDatePicker } from 'components/shared/form/input/date';
import { DataGrid } from 'components/shared/table';
import { fromUtc } from 'components/shared/util';
import { CreateDeliveryDialog } from 'components/shared/delivery/CreateDelivery';

const colDefs: Array<ColDef> = [
  {
    field: 'DeliveryDate',
    headerName: 'Date',
    flex: 1,
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
    sort: 'asc',
    sortable: true,
  },
  {
    field: 'Location.locationName',
    headerName: 'Location',
    width: 400,
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    field: 'MaxDailyQuantity',
    headerName: 'Max Expected',
    flex: 1,
    sortable: true,
    valueFormatter: numberFormatter,
  },
  {
    field: 'MinDailyQuantity',
    headerName: 'Min Expected',
    flex: 1,
    sortable: true,
    valueFormatter: numberFormatter,
  },
  {
    field: 'NominatedQuantity',
    headerName: 'Nominated',
    flex: 1,
    sortable: true,
    valueFormatter: numberFormatter,
  },
  {
    field: 'ScheduledQuantity',
    headerName: 'Scheduled',
    flex: 1,
    sortable: true,
    valueFormatter: numberFormatter,
  },
  {
    field: 'ActualQuantity',
    headerName: 'Actual',
    flex: 1,
    sortable: true,
    valueFormatter: numberFormatter,
  },
  {
    field: 'Imbalance',
    headerName: 'Imbalance',
    flex: 1,
    sortable: true,
    valueFormatter: numberFormatter,
  },
  {
    field: 'Trades',
    headerName: 'Trades',
    flex: 1,
    sortable: true,
    valueFormatter: numberFormatter,
  },
];

export interface ActivityProps {
  setStartDate: Dispatch<SetStateAction<string | undefined>>;
  setEndDate: Dispatch<SetStateAction<string | undefined>>;
}

export const Scheduling = () => {
  const { startDate, endDate } = useSearch();
  const navigate = useNavigate();
  const setStartDate = useCallback(
    (value?: string) => {
      navigate({ search: (search) => ({ ...search, startDate: value }) });
    },
    [navigate],
  );
  const setEndDate = useCallback(
    (value?: string) => {
      navigate({ search: (search) => ({ ...search, endDate: value }) });
    },
    [navigate],
  );
  const { businessId } = useParams();
  const { data: directory } = useBusiness(businessId);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const { mspId } = useOrgMsp();
  const tradeQuery = useMemo(
    () => ({
      query: {
        DeliveryPeriodStart: {
          type: QueryOperator.LESS_THAN_OR_EQUAL,
          filter: endDate,
        },
        DeliveryPeriodEnd: {
          type: QueryOperator.MORE_THAN_OR_EQUAL,
          filter: startDate,
        },
        ChannelId: {
          type: QueryOperator.EQUALS,
          filter: directory?.channel?.ChannelId,
        },
      },
    }),
    [endDate, startDate, directory?.channel?.ChannelId],
  );
  const deliveryQuery = useMemo(
    () => ({
      query: {
        Date: {
          type: QueryOperator.BETWEEN,
          filter: [startDate, endDate],
        },
        ChannelId: {
          type: QueryOperator.EQUALS,
          filter: directory?.channel?.ChannelId,
        },
      },
    }),
    [endDate, startDate, directory?.channel?.ChannelId],
  );
  const { data } = useSearchTrades(tradeQuery, Boolean(directory));
  const { data: locations } = useTspLocations();
  const { data: deliveries } = useDeliveries(
    deliveryQuery as QueryFactoryParams<IDelivery>,
  );
  const rowData = useMemo(() => {
    const days = eachDayOfInterval({
      start: new Date(startDate),
      end: new Date(endDate),
    });
    const rows = days
      .map((tradeDate) => {
        const date = fromUtc(tradeDate)?.toISOString() as string;
        const date2 = fromUtc(endOfDay(tradeDate))?.toISOString() as string;
        const trades = data?.data.filter(
          (trade) =>
            trade.DeliveryPeriodStart <= date2 &&
            trade.DeliveryPeriodEnd >= date,
        );
        let locationTotal = {};
        if (trades) {
          locationTotal = trades.reduce((acc: Record<string, any>, trade) => {
            const existing = get(acc, trade.DeliveryLocation);
            const MaxDailyQuantity =
              (existing?.MaxDailyQuantity || 0) +
              (trade?.Type === 'Buy'
                ? trade?.MaxDailyQuantity || 0
                : -(trade?.MaxDailyQuantity || 0));
            const MinDailyQuantity =
              (existing?.MinDailyQuantity || 0) +
              (trade?.Type === 'Buy'
                ? trade?.MinDailyQuantity || 0
                : -(trade?.MinDailyQuantity || 0));
            const Trades = (existing?.Trades || 0) + 1;
            set(acc, trade.DeliveryLocation, {
              LocationId: trade.DeliveryLocation,
              MaxDailyQuantity,
              MinDailyQuantity,
              DeliveryDate: date,
              Trades,
            });
            return acc;
          }, {});
        }
        deliveries?.data.forEach((delivery) => {
          if (delivery.Date === date) {
            const existing = get(locationTotal, delivery.DeliveryLocation);
            const isRecipient = delivery.ReceivingParty === mspId;
            const deliveryNominatedQuantity = isRecipient
              ? delivery.NominatedQuantity
              : -(delivery.NominatedQuantity || 0);
            const deliveryScheduledQuantity = isRecipient
              ? delivery.ScheduledQuantity
              : -(delivery.ScheduledQuantity || 0);
            const deliveryActualQuantity = isRecipient
              ? delivery.ActualQuantity
              : -(delivery.ActualQuantity || 0);
            const NominatedQuantity =
              (existing?.NominatedQuantity || 0) +
              (deliveryNominatedQuantity || 0);
            const ScheduledQuantity =
              (existing?.ScheduledQuantity || 0) + deliveryScheduledQuantity;
            const ActualQuantity =
              (existing?.ActualQuantity || 0) + deliveryActualQuantity;
            set(
              locationTotal,
              `${delivery.DeliveryLocation}.NominatedQuantity`,
              NominatedQuantity,
            );
            set(
              locationTotal,
              `${delivery.DeliveryLocation}.ScheduledQuantity`,
              ScheduledQuantity,
            );
            set(
              locationTotal,
              `${delivery.DeliveryLocation}.ActualQuantity`,
              ActualQuantity,
            );
            set(
              locationTotal,
              `${delivery.DeliveryLocation}.LocationId`,
              delivery.DeliveryLocation,
            );
            set(
              locationTotal,
              `${delivery.DeliveryLocation}.DeliveryDate`,
              date,
            );
          }
        });

        return Object.values(locationTotal);
      })
      .flat();
    const locationMap = keyBy(locations?.data || [], 'locationId');
    return rows.map((item) => {
      const row = item;
      const existing = locationMap[(item as any).LocationId];
      // @ts-ignore
      return { ...row, Location: existing };
    });
  }, [
    data?.data,
    deliveries?.data,
    endDate,
    locations?.data,
    mspId,
    startDate,
  ]);
  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mt={1}
      >
        <Box display="flex">
          <BaseDatePicker
            sx={{ marginRight: 2 }}
            label="Start"
            value={startDate ? new Date(startDate) : null}
            onChange={(value: Date | null) =>
              setStartDate(value?.toISOString() || undefined)
            }
          />
          <BaseDatePicker
            label="End"
            value={endDate ? new Date(endDate) : null}
            onChange={(value: Date | null) =>
              setEndDate(value?.toISOString() || undefined)
            }
          />
        </Box>
        <Button
          onClick={() => setCreateFormOpen(true)}
          variant="outlined"
          color="neutral"
          size="sm"
          sx={{ marginLeft: 2 }}
        >
          Create Delivery
        </Button>
      </Box>
      <CreateDeliveryDialog
        open={createFormOpen}
        handleClose={() => setCreateFormOpen(false)}
        channelId={directory?.channel?.ChannelId}
      />
      <Box flexGrow={1} height="100%">
        <DataGrid<any>
          columnDefs={colDefs}
          rowData={rowData as any}
          gridId="channel-scheduling"
          getRowId={({ data: innerData }) =>
            `${innerData.LocationId}${innerData.DeliveryDate}`
          }
        />
      </Box>
    </>
  );
};
