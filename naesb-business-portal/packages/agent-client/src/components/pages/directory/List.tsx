import { Card, Typography } from '@mui/joy';
import { ColDef, ColGroupDef, ValueGetterParams } from 'ag-grid-community';
import { useMyPublicDid } from 'query/dids';
import { useMemo } from 'react';
import { DataGrid } from 'components/shared/table';
import { useDirectory } from 'query/directory';
import { IChannel, IDirectory } from '@naesb/dlt-model';
import { DirectoryLinkCellRenderer } from './elements/DirectoryLinkCellRenderer';
import { RoleCellRenderer } from './elements/RoleCellRenderer';

const columnDefs: Array<ColDef | ColGroupDef> = [
  {
    headerName: 'Name',
    field: 'name',
    sortable: true,
    filter: true,
    floatingFilter: true,
    cellRenderer: DirectoryLinkCellRenderer,
  },
  {
    headerName: 'Roles',
    field: 'roles',
    sortable: true,
    filter: true,
    floatingFilter: true,
    cellRenderer: RoleCellRenderer,
  },
  {
    headerName: 'FERC ID',
    field: 'fercCid',
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    headerName: 'Connected',
    field: 'connection',
    valueGetter: ({ data }: ValueGetterParams<IDirectory>) => {
      const value = data?.connection;
      if (!value) return 'No';
      return value?.state === 'active' ? 'Yes' : value.state;
    },
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
  {
    headerName: 'Trading',
    valueGetter: ({ data }: ValueGetterParams<IDirectory>) => {
      const value = data?.channel as IChannel;
      if (!value) return 'No';
      return value?.NetworkStatus === 'Active'
        ? 'Yes'
        : value.NetworkStatus || (value.Status as string);
    },
    sortable: true,
    filter: true,
    floatingFilter: true,
  },
];

export const ListBusinessesPage = () => {
  const { data: myPublicDid } = useMyPublicDid();
  const { data: directory } = useDirectory();
  const rowData = useMemo(
    () =>
      directory?.data.filter(
        (row) =>
          row.businessStatus === 'ACTIVE' &&
          row.did !== myPublicDid?.result.did,
      ),
    [myPublicDid, directory],
  );
  return (
    <>
      <Typography level="h4" sx={{ marginBottom: 1 }}>
        All Companies
      </Typography>
      <Card sx={{ paddingX: 0, paddingY: 0 }}>
        <DataGrid rowData={rowData} columnDefs={columnDefs} />
      </Card>
    </>
  );
};
