import { ColDef, ValueGetterParams } from 'ag-grid-community';
import {
  performanceTypeFormatter,
  priceFormatter,
  priceTypeFormatter,
  StatusCellRenderer,
} from '@common/grid';
import { dateFormatter, DrilldownCellRenderer, Grid } from '@react/toolkit';
import { Card } from '@mui/material';
import { useSearchTrades } from '@query/trades';
import { IDeliveryAllocation } from '@naesb/dlt-model';

const colDefs: Array<ColDef> = [
  { field: 'DealId', headerName: 'ID', flex: 1 },
  {
    field: 'Status',
    cellClass: 'custom-ag-flex-vert-center',
    headerName: 'Status',
    flex: 1,
    cellRendererFramework: StatusCellRenderer,
  },
  {
    field: 'DeliveryLocation',
    headerName: 'Location',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'Type',
    headerName: 'Type',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'OrgDealId',
    headerName: 'Org Deal ID',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'CounterpartyDealId',
    headerName: 'Counterparty Deal ID',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'PriceType',
    headerName: 'Price Type',
    valueFormatter: priceTypeFormatter,
    flex: 1,
  },
  {
    field: 'PriceType',
    headerName: 'Price',
    valueFormatter: priceFormatter,
    flex: 1,
  },
  {
    field: 'PerformanceType',
    headerName: 'Performance',
    flex: 1,
    valueFormatter: performanceTypeFormatter,
  },
  {
    field: 'MaxDailyQuantity',
    headerName: 'QTY/DAY',
    flex: 1,
  },
  {
    field: 'Allocations',
    headerName: 'Delivered',
    flex: 1,
    valueGetter: ({ data }: ValueGetterParams) =>
      data.Allocations?.reduce(
        (acc: number, allocation: IDeliveryAllocation) =>
          acc + allocation.Quantity,
        0,
      ),
  },
  {
    field: 'DeliveryPeriodStart',
    headerName: 'Start Date',
    flex: 1,
    sort: 'asc',
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
  },
  {
    field: 'DeliveryPeriodEnd',
    headerName: 'End Date',
    flex: 1,
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
  },

  {
    field: 'DealId',
    headerName: '',
    cellRendererFramework: DrilldownCellRenderer,
    width: 55,
    cellClass: 'custom-ag-flex-end',
    cellRendererParams: {
      buildRoute: ({ value, data }: any) =>
        `/channels/${data.ChannelId}/trades/${value}`,
    },
    valueFormatter: () => 'View',
    minWidth: 55,
    maxWidth: 55,
    pinned: 'right',
  },
];

export const TradesGrid = () => {
  const { data } = useSearchTrades();
  return (
    <Card sx={{ height: 'calc(100% - 85px)' }}>
      <Grid
        columnDefs={colDefs}
        rowData={data?.data}
        getRowNodeId={(item) => item.DealId}
        gridOptions={{ domLayout: 'normal' }}
        gridId="trades"
        persistState
      />
    </Card>
  );
};
