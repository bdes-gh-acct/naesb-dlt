/* eslint-disable consistent-return */
/* eslint-disable array-callback-return */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Card } from '@mui/material';
import { ColDef } from 'ag-grid-community';
import { Grid, DrilldownCellRenderer } from '@react/toolkit';
import { useUsersOfOrg } from '@query/users';
import { Loading } from '@common/loading/Loading';
import { IUser } from '@naesb/dlt-model/build';
import { Error } from '../../../common/error/error';

export interface IUserRowData {
  name: string;
  email: string;
  userId: string;
  id: string;
}

const modifyData = (data: any): IUserRowData[] => {
  return data.map((user: IUser) => {
    if (user.user_id) {
      const id = user.user_id?.split('|');
      return {
        name: user.name,
        email: user.email,
        userId: user.user_id,
        id: id[1],
      };
    }
  });
};

export const UsersGrid = () => {
  const { data, isLoading, isError, error } = useUsersOfOrg({
    select: modifyData,
  });

  const colDefs: Array<ColDef> = [
    {
      field: 'id',
      headerName: 'Id',
      flex: 1,
    },
    {
      field: 'name',
      headerName: 'Name',
      flex: 1,
    },
    {
      field: 'email',
      headerName: 'Email',
      flex: 1,
    },
    {
      field: 'userId',
      headerName: '',
      cellClass: 'custom-ag-flex-end',
      valueFormatter: () => 'View',
      cellRendererFramework: DrilldownCellRenderer,
      cellRendererParams: {
        buildRoute: ({ value }: any) => `/users/${value}`,
      },
      minWidth: 75,
      maxWidth: 75,
      width: 75,
    },
  ];

  if (isLoading) {
    return <Loading />;
  }

  if (isError) {
    return <Error message={error?.message} />;
  }

  return (
    <Card>
      <Grid columnDefs={colDefs} rowData={data} gridId="users" persistState />
    </Card>
  );
};
