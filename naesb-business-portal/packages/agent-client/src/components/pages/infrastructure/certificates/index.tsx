import { Box, Card, Typography, IconButton } from '@mui/joy';
import { ColDef } from 'ag-grid-community';
import { DataGrid } from 'components/shared/table';
import AddIcon from '@mui/icons-material/AddOutlined';
import { useCertificates } from 'query/certificates';
import { useState } from 'react';
import { formatDate } from 'components/shared/util';
import { TradeDialog } from './elements/Create';

const columnDefs: Array<ColDef> = [
  {
    headerName: 'Schema',
    field: 'schema.name',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    headerName: 'ID',
    field: 'target_id',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    headerName: 'Target Name',
    field: 'target_name',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },

  {
    headerName: 'Rating',
    field: 'rating',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    headerName: 'Score',
    field: 'score',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    headerName: 'Effective',
    field: 'effective',
    sortable: true,
    filter: true,
    floatingFilter: true,
    valueFormatter: ({ value, data }) => {
      return data ? formatDate(value, undefined, true) || '' : '';
    },
  },
  {
    headerName: 'Expires',
    field: 'expiration',
    sortable: true,
    filter: true,
    floatingFilter: true,
    valueFormatter: ({ value, data }) => {
      return data ? formatDate(value, undefined, true) || '' : '';
    },
  },
];

export const CertificatesPage = () => {
  const { data: wells } = useCertificates();
  const [open, setOpen] = useState(false);
  return (
    <Card sx={{ paddingX: 0, paddingY: 0 }}>
      <TradeDialog open={open} setOpen={setOpen} />
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        pt={2}
        px={2}
      >
        <Typography level="h4">Certificates</Typography>
        <Box>
          <IconButton variant="soft" size="sm" onClick={() => setOpen(true)}>
            <AddIcon />
          </IconButton>
        </Box>
      </Box>
      <DataGrid rowData={wells?.data} columnDefs={columnDefs} />
    </Card>
  );
};
