import { ColDef, ValueFormatterParams } from 'ag-grid-community';
// @ts-ignore
import { DrilldownCellRenderer, Grid } from '@react/toolkit';
import { useChannels } from '@query/channels';
import { Card } from '@mui/material';
import { useOrganizations } from '@query/organization';
import { useCallback } from 'react';

export const ChannelGrid = () => {
  const { data } = useChannels();
  const { data: organizationData } = useOrganizations();
  console.log(data);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const organizationNameFormatter = useCallback(
    ({ value }: ValueFormatterParams) => {
      if (!organizationData || !data) return '';
      console.log(organizationData, value);
      const organization = organizationData.find(
        (org) => org.metadata.msp_id === value,
      );
      return organization?.display_name || '';
    },
    [organizationData, data],
  );

  const colDefs: Array<ColDef> = [
    {
      field: 'ChannelId',
      headerName: 'Name',
      flex: 1,
      // valueFormatter: organizationNameFormatter,
    },
    {
      field: 'ChannelId',
      headerName: '',
      cellRendererFramework: DrilldownCellRenderer,
      cellClass: 'custom-ag-flex-end',
      cellRendererParams: {
        buildRoute: ({ value }: any) => `/channels/${value}`,
      },
      valueFormatter: () => 'View',
      minWidth: 75,
      maxWidth: 75,
      width: 75,
    },
  ];

  return (
    <Card>
      <Grid
        columnDefs={colDefs}
        rowData={data?.data}
        gridId="channels"
        persistState
      />
    </Card>
  );
};
