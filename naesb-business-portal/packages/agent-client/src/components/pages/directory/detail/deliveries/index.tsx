/* eslint-disable no-plusplus */
/* eslint-disable @typescript-eslint/naming-convention */
import { Box, Button } from '@mui/joy';
import { useDeliveries } from 'query/deliveries';
import { useTspLocations } from 'query/tsp';
import {
  IDeliveryAllocation,
  IDelivery,
  QueryFactoryParams,
  QueryOperator,
} from '@naesb/dlt-model';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
import { keyBy } from 'lodash';
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
import { useBusiness } from 'query/directory';
import { useNavigate, useParams, useSearch } from '@tanstack/router';
import { BaseDatePicker } from 'components/shared/form/input/date';
import { DataGrid } from 'components/shared/table';
import { CreateDeliveryDialog } from 'components/shared/delivery/CreateDelivery';
import { DeliveryModalCellRenderer } from 'components/shared/table/cellRenderers/DeliveryModalCellRenderer';
import { DeliveryIdCellRenderer } from 'components/shared/table/cellRenderers';

const colDefs: Array<ColDef> = [
  {
    field: 'DeliveryId',
    headerName: 'Contract',
    sortable: true,
    filter: true,
    floatingFilter: true,
    cellRenderer: DeliveryIdCellRenderer,
  },
  {
    field: 'Date',
    headerName: 'Date',
    flex: 1,
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
    sort: 'asc',
    sortable: true,
  },
  {
    field: 'Location.organization.name',
    headerName: 'TSP',
    wrapText: true,
    autoHeight: true,
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
  },
  {
    field: 'Location.locationName',
    headerName: 'Location',
    wrapText: true,
    autoHeight: true,
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
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
    field: 'Allocations',
    headerName: 'Allocated',
    valueGetter: ({ data }: ValueGetterParams) => {
      return data?.Allocations?.reduce(
        (acc: number, allocation: IDeliveryAllocation) =>
          acc + allocation.Quantity,
        0,
      );
    },
  },
  {
    field: 'DelviveryId',
    headerName: 'Actions',
    cellRenderer: DeliveryModalCellRenderer,
  },
];

export interface ActivityProps {
  setStartDate: Dispatch<SetStateAction<string | undefined>>;
  setEndDate: Dispatch<SetStateAction<string | undefined>>;
}

export const Deliveries = () => {
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

  const { data: locations } = useTspLocations();
  const { data: deliveries } = useDeliveries(
    deliveryQuery as QueryFactoryParams<IDelivery>,
  );
  const rowData = useMemo(() => {
    const locationMap = keyBy(locations?.data || [], 'locationId');
    return deliveries?.data.map((item) => {
      const row = item;
      const existing = locationMap[item.DeliveryLocation];
      // @ts-ignore
      return { ...row, Location: existing };
    });
  }, [deliveries?.data, locations?.data]);
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
          getRowId={({ data: innerData }) => innerData.DeliveryId}
        />
      </Box>
    </>
  );
};
