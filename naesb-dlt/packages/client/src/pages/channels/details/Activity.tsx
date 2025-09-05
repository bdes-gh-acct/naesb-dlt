/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/naming-convention */
import { BaseDatePicker } from '@common/form';
import { Box, Button } from '@mui/material';
import { useDeliveries } from '@query/deliveries';
import { useSearchTrades } from '@query/trades';
import { useTspLocations } from '@query/tsp';
import { dateFormatter, fromUtc, Grid, toUtc } from '@react/toolkit';
import { IDelivery, ITradeViewModel, QueryOperator } from '@naesb/dlt-model';
import { ColDef } from 'ag-grid-community';
import { addDays, differenceInDays, max, min, startOfDay } from 'date-fns';
import { sumBy } from 'lodash';
import AddIcon from '@mui/icons-material/Add';
import { useState, FC, useMemo, Dispatch, SetStateAction } from 'react';
import { CreateDeliveryDialog } from '@pages/deliveries/create';
import { useOrgMsp } from '@common/hooks';

const colDefs: Array<ColDef> = [
  {
    field: 'DeliveryDate',
    headerName: 'Date',
    flex: 1,
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
    sort: 'asc',
  },
  { field: 'Location', headerName: 'Location', width: 400 },
  { field: 'MaxDailyQuantity', headerName: 'Max Expected', flex: 1 },
  { field: 'MinDailyQuantity', headerName: 'Min Expected', flex: 1 },
  { field: 'NominatedQuantity', headerName: 'Nominated', flex: 1 },
  { field: 'ScheduledQuantity', headerName: 'Scheduled', flex: 1 },
  { field: 'ActualQuantity', headerName: 'Actual', flex: 1 },
  { field: 'Imbalance', headerName: 'Imbalance', flex: 1 },
  { field: 'Trades', headerName: 'Trades', flex: 1 },
];

export interface ActivityProps {
  startDate?: string;
  endDate?: string;
  setStartDate: Dispatch<SetStateAction<string | undefined>>;
  setEndDate: Dispatch<SetStateAction<string | undefined>>;
}

export const Activity: FC<ActivityProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => {
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const { org_msp } = useOrgMsp();
  const { data } = useSearchTrades({
    query: [
      {
        DeliveryPeriodStart: {
          type: QueryOperator.BETWEEN,
          filter: [startDate, endDate],
        },
      },
      {
        DeliveryPeriodEnd: {
          type: QueryOperator.BETWEEN,
          filter: [startDate, endDate],
        },
      },
      {
        DeliveryPeriodEnd: {
          type: QueryOperator.MORE_THAN_OR_EQUAL,
          filter: endDate,
        },
        DeliveryPeriodStart: {
          type: QueryOperator.LESS_THAN_OR_EQUAL,
          filter: startDate,
        },
      },
    ],
  });
  const { data: locations } = useTspLocations();
  const { data: deliveries } = useDeliveries();
  const rowData = useMemo(() => {
    if (!data || !locations) return undefined;
    const unique = data.data.reduce(
      (acc: Record<string, { MinDate: string; MaxDate: string }>, trade) => {
        const current = acc[trade.DeliveryLocation];
        if (!current) {
          return {
            ...acc,
            [trade.DeliveryLocation]: {
              MinDate: trade.DeliveryPeriodStart,
              MaxDate: trade.DeliveryPeriodEnd,
            },
          };
        }
        return {
          ...acc,
          [trade.DeliveryLocation]: {
            MinDate:
              trade.DeliveryPeriodStart < current.MinDate
                ? trade.DeliveryPeriodStart
                : current.MinDate,
            MaxDate:
              trade.DeliveryPeriodEnd > current.MaxDate
                ? trade.DeliveryPeriodEnd
                : current.MaxDate,
          },
        };
      },
      {},
    );
    const locationDates = Object.entries(unique).reduce(
      (acc: Array<any>, [LocationId, { MinDate, MaxDate }]) => {
        const Min = max([
          new Date(startDate as string),
          new Date(MinDate),
        ]).toISOString();
        const Max = min([
          new Date(endDate as string),
          new Date(MaxDate),
        ]).toISOString();

        const duration =
          differenceInDays(addDays(new Date(Max), 1), new Date(Min)) || 0;
        for (let i = 0; i < duration; i++) {
          const tradeDate = toUtc(
            startOfDay(fromUtc(addDays(new Date(Min), i))),
          ).toISOString();
          const activeTrades = data.data.filter(
            (trade) =>
              trade.DeliveryPeriodStart <= tradeDate.toString() &&
              trade.DeliveryPeriodEnd >= tradeDate.toString() &&
              trade.DeliveryLocation === LocationId,
          );
          const dateData = activeTrades.reduce(
            (
              innerAcc: {
                MaxDailyQuantity: number;
                MinDailyQuantity: number;
              },
              trade: ITradeViewModel,
            ) => {
              return {
                MaxDailyQuantity:
                  innerAcc.MaxDailyQuantity +
                  (trade?.Type === 'Buy'
                    ? trade?.MaxDailyQuantity || 0
                    : -(trade?.MaxDailyQuantity || 0)),
                MinDailyQuantity:
                  innerAcc.MinDailyQuantity +
                  (trade?.Type === 'Buy'
                    ? trade?.MinDailyQuantity || 0
                    : -(trade?.MinDailyQuantity || 0)),
              };
            },
            { MaxDailyQuantity: 0, MinDailyQuantity: 0 },
          );

          // @ts-ignore
          const dateDeliveries = (deliveries?.data || []).filter(
            (delivery: IDelivery) =>
              delivery.Date === tradeDate && delivery.Location === LocationId,
          );
          const NominatedQuantity = sumBy(dateDeliveries, (del: IDelivery) =>
            del.ReceivingParty === org_msp
              ? del.NominatedQuantity || 0
              : 0 - (del.NominatedQuantity || 0),
          );
          const ScheduledQuantity = sumBy(dateDeliveries, (del: IDelivery) =>
            del.ReceivingParty === org_msp
              ? del.ScheduledQuantity || 0
              : 0 - (del.ScheduledQuantity || 0),
          );
          const ActualQuantity = sumBy(dateDeliveries, (del: IDelivery) =>
            del.ReceivingParty === org_msp
              ? del.ActualQuantity || 0
              : 0 - (del.ActualQuantity || 0),
          );
          if (activeTrades.length || NominatedQuantity) {
            acc.push({
              LocationId,
              Location: locations?.data?.find(
                (location) => location.Loc === LocationId,
              )?.LocationName,
              DeliveryDate: tradeDate,
              NominatedQuantity,
              ScheduledQuantity,
              ActualQuantity,
              MaxDailyQuantity: dateData.MaxDailyQuantity,
              MinDailyQuantity: dateData.MinDailyQuantity,
              Imbalance: ActualQuantity - dateData.MinDailyQuantity,
              Trades: activeTrades.length,
            });
          }
        }
        return acc;
      },
      [],
    );
    return locationDates;
  }, [data, locations, startDate, endDate, deliveries?.data, org_msp]);
  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <BaseDatePicker
            useUtc
            sx={{ marginRight: 2 }}
            label="Start"
            value={startDate}
            onChange={(value: string | null) =>
              setStartDate(value || undefined)
            }
          />
          <BaseDatePicker
            useUtc
            label="End"
            value={endDate}
            onChange={(value: string | null) => setEndDate(value || undefined)}
          />
        </Box>
        <Button
          onClick={() => setCreateFormOpen(true)}
          color="primary"
          variant="contained"
          sx={{ marginLeft: 2 }}
        >
          <AddIcon /> Create Delivery
        </Button>
      </Box>
      <CreateDeliveryDialog
        open={createFormOpen}
        handleClose={() => setCreateFormOpen(false)}
      />
      <Box my={2} flexGrow={1} height="100%">
        <Grid
          columnDefs={colDefs}
          rowData={rowData}
          gridOptions={{ domLayout: 'normal' }}
          gridId="channel-trades"
          persistState
          getRowNodeId={(innerData) =>
            `${innerData.LocationId}${innerData.DeliveryDate}`
          }
        />
      </Box>
    </>
  );
};
