/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ColDef } from 'ag-grid-community';
import Layout from '../../components/layouts';
import { DataGrid } from '../../components/shared/grid';
import { useOrganizations } from '../../service/organization';

const columnDefs: Array<ColDef> = [
  {
    field: 'businessId',

    headerName: 'Business ID',
  },
  {
    field: 'name',

    headerName: 'Business Name',
  },
  {
    field: 'address',

    headerName: 'Address',
  },
  {
    field: 'website',

    headerName: 'Business Website',
  },
  {
    field: 'taxNumber',
    headerName: 'Tax Number',
  },
  {
    field: 'taxNumberType',
    headerName: 'Tax Number Type',
  },
  {
    field: 'jurisdiction',

    headerName: 'Jurisdiction',
  },
  {
    field: 'companyType',

    headerName: 'Company Type',
  },
  {
    field: 'businessStatus',

    headerName: 'Business Status',
  },
];

// @ts-ignore
export default () => {
  const { data } = useOrganizations();
  return (
    <Layout.Root>
      <DataGrid
        rowData={data?.data}
        columnDefs={columnDefs}
        defaultColDef={{ sortable: true, filter: true, floatingFilter: true }}
      />
    </Layout.Root>
  );
};
