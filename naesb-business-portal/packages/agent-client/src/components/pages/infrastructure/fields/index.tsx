import { Box, Card, Typography, IconButton } from '@mui/joy';
import { ColDef } from 'ag-grid-community';
import { DataGrid } from 'components/shared/table';
import { useFields } from 'query/field';
import AddIcon from '@mui/icons-material/AddOutlined';
import { useState } from 'react';
import { CreateFieldDialog } from './elements/Create';

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
    headerName: 'Created By',
    field: 'createdBy',
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
  {
    headerName: 'Updated By',
    field: 'updatedBy',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    headerName: 'Updated',
    field: 'updated',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
];

export const FieldsPage = () => {
  const { data: fields } = useFields();
  const [open, setOpen] = useState(false);
  return (
    <Card sx={{ paddingX: 0, paddingY: 0 }}>
      <CreateFieldDialog open={open} setOpen={setOpen} />
      <Box
        width="100%"
        display="flex"
        justifyContent="space-between"
        pt={2}
        px={2}
      >
        <Typography level="h4">Fields</Typography>
        <Box>
          <IconButton variant="soft" size="sm" onClick={() => setOpen(true)}>
            <AddIcon />
          </IconButton>
        </Box>
      </Box>
      <DataGrid rowData={fields?.data} columnDefs={columnDefs} />
    </Card>
  );
};
