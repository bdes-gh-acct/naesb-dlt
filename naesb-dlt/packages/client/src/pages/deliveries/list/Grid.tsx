import {
  ColDef,
  GridApi,
  GridReadyEvent,
  ValueGetterParams,
} from 'ag-grid-community';
import {
  dateFormatter,
  DialogCellRenderer,
  Grid,
  useGetRowsService,
} from '@react/toolkit';
import { Box, Card } from '@mui/material';
import { IDeliveryAllocation } from '@naesb/dlt-model';
import { useState } from 'react';
import { DeliveryDialog } from './deliveryDetails/Dialog';

const colDefs: Array<ColDef> = [
  {
    field: 'Date',
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
    headerName: 'Date',
  },
  {
    field: 'DeliveryId',
    headerName: 'Id',
    width: 400,
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'TspBusinessId',
    headerName: 'TSP',
    floatingFilter: true,
    filter: 'agNumberColumnFilter',
  },
  {
    field: 'ServiceRequestorParty',
    headerName: 'Requestor',
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'ReceivingParty',
    headerName: 'Recipient',
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'Location',
    headerName: 'Location',
    floatingFilter: true,
    filter: 'agNumberColumnFilter',
  },
  {
    field: 'NominatedQuantity',
    headerName: 'Nominated Quantity',
  },
  {
    field: 'ScheduledQuantity',
    headerName: 'Scheduled Quantity',
  },
  {
    field: 'ActualQuantity',
    headerName: 'Actual Quantity',
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
    headerName: '',
    pinned: 'right',
    width: 65,
    cellRendererFramework: DialogCellRenderer,
    cellRendererParams: {
      renderContent: DeliveryDialog,
      maxWidth: 'lg',
    },
  },
];

export const DeliveriesGrid = () => {
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const dataSource = useGetRowsService({
    url: '/api/ledger/v1/explorer/deliveries/search',
    gridApi,
  });
  return (
    <Box flexGrow={1}>
      <Card sx={{ height: '100%' }}>
        <Grid
          columnDefs={colDefs}
          datasource={{ getRows: dataSource }}
          onGridReady={({ api }: GridReadyEvent) => setGridApi(api)}
          gridOptions={{ rowModelType: 'infinite', domLayout: 'normal' }}
          getRowNodeId={(item) => item.DeliveryId}
          gridId="deliveries"
          persistState
        />
      </Card>
    </Box>
  );
};
