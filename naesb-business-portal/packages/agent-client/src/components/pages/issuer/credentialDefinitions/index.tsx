import { Box, Card, Typography, IconButton } from '@mui/joy';
import { ColDef } from 'ag-grid-community';
import { DataGrid } from 'components/shared/table';
import AddIcon from '@mui/icons-material/AddOutlined';
import { useCredentialDefinitions } from 'query/credentialDefinitions';
import { useState } from 'react';
import { CreateCredentialDefinitionDialog } from './elements/Create';

const columnDefs: Array<ColDef> = [
  {
    headerName: 'Schema',
    field: 'schema.name',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    headerName: 'Schema Version',
    field: 'schema.version',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    headerName: 'ID',
    field: 'id',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    headerName: 'Tag',
    field: 'tag',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },

  {
    headerName: 'Created',
    field: 'created',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
];

export const CredentialDefinitionPage = () => {
  const { data: credentialDefinitions } = useCredentialDefinitions();
  const [open, setOpen] = useState(false);
  return (
    <Card sx={{ paddingX: 0, paddingY: 0 }}>
      <CreateCredentialDefinitionDialog open={open} setOpen={setOpen} />
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        pt={2}
        px={2}
      >
        <Typography level="h4">Certificate Definitions</Typography>
        <Box>
          <IconButton variant="soft" size="sm" onClick={() => setOpen(true)}>
            <AddIcon />
          </IconButton>
        </Box>
      </Box>
      <DataGrid rowData={credentialDefinitions?.data} columnDefs={columnDefs} />
    </Card>
  );
};
