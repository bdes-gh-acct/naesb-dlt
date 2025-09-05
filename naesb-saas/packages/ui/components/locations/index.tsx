import { ColDef, GridReadyEvent, GridApi } from 'ag-grid-community';
import { Box, Card } from '@mui/joy';
import { useState } from 'react';
import { ITspLocation } from '@shared/model';
import { DataGrid } from '../shared/grid';
import { useGetRowsService } from '../shared/grid/useGetRowsService';

const colDefs: Array<ColDef> = [
  {
    field: 'organization.name',
    headerName: 'TSP NAME',
    floatingFilter: true,
    filter: true,
    sortable: false,
    width: 300,
    suppressMenu: true,
  },
  {
    field: 'organization.fercCid',
    headerName: 'TSP FERC CID',
    flex: 1,
    floatingFilter: true,
    filter: true,
    width: 200,
    suppressMenu: true,
  },
  {
    field: 'locationId',
    headerName: 'Location ID',
    flex: 1,
    floatingFilter: true,
    filter: true,
    suppressMenu: true,
  },
  {
    field: 'locationName',
    headerName: 'Name',
    flex: 1,
    floatingFilter: true,
    filter: true,
    suppressMenu: true,
  },
  {
    field: 'directionOfFlow',
    headerName: 'Dir Flo',
    flex: 1,
    floatingFilter: true,
    filter: true,
    hide: true,
    suppressMenu: true,
  },
  {
    field: 'directionOfFlowCode.description',
    headerName: 'Dir Flo Name',
    flex: 1,
    floatingFilter: true,
    filter: true,
    suppressMenu: true,
  },
  {
    field: 'typeIndicator',
    headerName: 'Loc Typ Ind',
    flex: 1,
    floatingFilter: true,
    filter: true,
    hide: true,
    suppressMenu: true,
  },
  {
    field: 'typeIndicatorCode.description',
    headerName: 'Loc Typ Ind Name',
    flex: 1,
    floatingFilter: true,
    filter: true,
    suppressMenu: true,
  },
  {
    field: 'county',
    headerName: 'Loc Cnty',
    flex: 1,
    floatingFilter: true,
    filter: true,
    suppressMenu: true,
  },
  {
    field: 'state',
    headerName: 'Loc St Abbrev',
    flex: 1,
    floatingFilter: true,
    filter: true,
    suppressMenu: true,
  },
  {
    field: 'statusIndicator',
    headerName: 'Status',
    flex: 1,
    floatingFilter: true,
    filter: true,
    suppressMenu: true,
  },
  {
    field: 'zone',
    headerName: 'Loc Zone',
    flex: 1,
    floatingFilter: true,
    filter: true,
    suppressMenu: true,
  },
  {
    field: 'effectiveDate',
    headerName: 'Eff Date',
    flex: 1,
    suppressMenu: true,
  },
  {
    field: 'inactiveDate',
    headerName: 'Inact Date',
    flex: 1,
    suppressMenu: true,
  },
  // {
  //   field: 'upstreamDownstreamEntityIndicator',
  //   headerName: 'Up/Dn Ind',
  //   flex: 1,
  //   floatingFilter: true,
  //   filter: true,
  //   suppressMenu: true,
  // },
  // {
  //   field: 'upstreamDownstreamEntityName',
  //   headerName: 'Up/Dn Name',
  //   flex: 1,
  //   floatingFilter: true,
  //   filter: true,
  //   suppressMenu: true,
  // },
  // {
  //   field: 'upstreamDownstreamIdentifierCode',
  //   headerName: 'Up/Dn ID',
  //   flex: 1,
  //   floatingFilter: true,
  //   filter: true,
  //   suppressMenu: true,
  // },
  // {
  //   field: 'upstreamDownstreamIdentifierProprietaryCode',
  //   headerName: 'Up/Dn ID Prop',
  //   flex: 1,
  //   floatingFilter: true,
  //   filter: true,
  //   suppressMenu: true,
  // },
  // {
  //   field: 'upstreamDownstreamEntityFercCidIndicator',
  //   headerName: 'Up/Dn FERC CID Ind',
  //   flex: 1,
  //   floatingFilter: true,
  //   filter: true,
  //   suppressMenu: true,
  // },
  // {
  //   field: 'upstreamDownstreamEntityFercCid',
  //   headerName: 'Up/Dn FERC CID',
  //   flex: 1,
  //   floatingFilter: true,
  //   filter: true,
  //   suppressMenu: true,
  // },
  // {
  //   field: 'upstreamDownstreamEntityLocationName',
  //   headerName: 'Up/Dn Loc Name',
  //   flex: 1,
  //   floatingFilter: true,
  //   filter: true,
  //   suppressMenu: true,
  // },
  // {
  //   field: 'upstreamDownstreamEntityLocation',
  //   headerName: 'Up/Dn Loc',
  //   flex: 1,
  //   floatingFilter: true,
  //   filter: true,
  //   suppressMenu: true,
  // },
];

export const Locations = () => {
  const [gridApi, setGridApi] = useState<GridApi | undefined>(undefined);
  const dataSource = useGetRowsService({
    url: '/api/locations/search',
    gridApi,
  });

  return (
    <Box height="100%" width="100%">
      <Card sx={{ height: '100%', width: '100%', padding: 0 }}>
        <DataGrid
          columnDefs={colDefs}
          onGridReady={({ api }: GridReadyEvent) => setGridApi(api)}
          datasource={{ getRows: dataSource }}
          gridId="tsp-locations"
          rowModelType="infinite"
          domLayout="normal"
          getRowNodeId={(data: ITspLocation) => data.locationId}
        />
      </Card>
    </Box>
  );
};
