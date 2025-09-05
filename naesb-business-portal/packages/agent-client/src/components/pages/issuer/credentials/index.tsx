import { Box, Card, Typography, IconButton } from '@mui/joy';
import { ColDef } from 'ag-grid-community';
import { DataGrid } from 'components/shared/table';
import AddIcon from '@mui/icons-material/AddOutlined';
import { useCredentials } from 'query/credential';
import { formatDate } from 'components/shared/util';
import { useState } from 'react';
import { IssueCredentialDialog } from './elements/Create';

const columnDefs: Array<ColDef> = [
  {
    headerName: 'Created',
    field: 'cred_ex_record.created_at',
    sortable: true,
    filter: true,
    floatingFilter: true,
    valueFormatter: ({ value, data }) => {
      return data ? formatDate(value) || '' : '';
    },
  },
  {
    headerName: 'Connection',
    field: 'cred_ex_record.connection_id',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    headerName: 'ID',
    field: 'cred_ex_record.cred_ex_id',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
];

export const IssuedCredentialsPage = () => {
  const { data: credentialDefinitions } = useCredentials();
  const [open, setOpen] = useState(false);
  return (
    <Card sx={{ paddingX: 0, paddingY: 0 }}>
      <IssueCredentialDialog open={open} setOpen={setOpen} />
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        pt={2}
        px={2}
      >
        <Typography level="h4">Issued Certificates</Typography>
        <Box>
          <IconButton variant="soft" size="sm" onClick={() => setOpen(true)}>
            <AddIcon />
          </IconButton>
        </Box>
      </Box>
      <DataGrid
        rowData={credentialDefinitions?.data}
        columnDefs={columnDefs}
        getRowId={({ data }) => data.cred_ex_record.cred_ex_id}
      />
    </Card>
  );
};
