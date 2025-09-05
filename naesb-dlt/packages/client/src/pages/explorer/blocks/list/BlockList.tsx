import { ColDef, GridApi, GridReadyEvent } from 'ag-grid-community';
import { Grid, useGetRowsService } from '@react/toolkit';
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
    field: 'transactionCount',
    headerName: 'Txns',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'hash',
    headerName: 'Hash',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'previous_hash',
    headerName: 'Previous Hash',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },
];

export const BlockList = () => {
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);

  const dataSource = useGetRowsService({
    url: '/api/ledger/v1/explorer/blocks/search',
    gridApi,
  });
  return (
    <Box marginTop="40px" height="80%">
      <Card sx={{ height: '100%' }}>
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
