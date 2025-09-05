import { Box, Card, Typography } from '@mui/joy';
import { ColDef } from 'ag-grid-community';
import { DataGrid } from 'components/shared/table';
import { useSchemas } from 'query/schemas';

const columnDefs: Array<ColDef> = [
  {
    headerName: 'ID',
    field: 'id',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    headerName: 'Name',
    field: 'name',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    headerName: 'Version',
    field: 'version',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    headerName: 'Created By',
    field: 'createdBy',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
];

export const SchemasPage = () => {
  const { data: schemas } = useSchemas();
  return (
    <Card sx={{ paddingX: 0, paddingY: 0 }}>
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        pt={2}
        px={2}
      >
        <Typography level="h4">Schemas</Typography>
      </Box>
      <DataGrid rowData={schemas?.data} columnDefs={columnDefs} />
    </Card>
  );
};
