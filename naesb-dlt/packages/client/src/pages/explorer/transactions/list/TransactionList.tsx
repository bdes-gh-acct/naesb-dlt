import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
// @ts-ignore
import { dateFormatter, Grid, useGetRowsService } from '@react/toolkit';
import { Box, Card } from '@mui/material';
import { useState } from 'react';

const colDefs: Array<ColDef> = [
  {
    field: 'block_number',
    headerName: 'Block',
    floatingFilter: true,
    filter: 'agNumberColumnFilter',
    sort: 'asc',
    width: 125,
  },
  {
    field: 'id',
    headerName: 'Transaction',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'channel_id',
    headerName: 'Channel',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },

  {
    field: 'creator',
    headerName: 'Creator',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'contract',
    headerName: 'Contract',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'contract_version',
    headerName: 'Contract Version',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'timestamp',
    headerName: 'Created',
    flex: 1,
    valueFormatter: dateFormatter(),
  },
];

export const TransactionList = () => {
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);

  const dataSource = useGetRowsService({
    url: '/api/ledger/v1/explorer/transactions/search',
    gridApi,
  });

  return (
    <Box marginTop="40px" height="calc(100% - 64px)" flexGrow={1}>
      <Card sx={{ height: 'calc(100% - 64px)' }}>
        <Grid
          onGridReady={({ api }: GridReadyEvent) => setGridApi(api)}
          columnDefs={colDefs}
          datasource={{ getRows: dataSource }}
          gridOptions={{ rowModelType: 'infinite', domLayout: 'normal' }}
          gridId="explorer-transactions"
          persistState
        />
      </Card>
    </Box>
  );
};
