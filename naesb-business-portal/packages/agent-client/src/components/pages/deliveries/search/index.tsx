import { Card, Typography } from '@mui/joy';
import { useMemo } from 'react';
import { keyBy } from 'lodash';
import { IDeliveryAllocation } from '@naesb/dlt-model';
import { ColDef, ValueGetterParams } from 'ag-grid-community';
import { DataGrid } from 'components/shared/table';
import { DeliveryModalCellRenderer } from 'components/shared/table/cellRenderers/DeliveryModalCellRenderer';
import {
  dateFormatter,
  numberFormatter,
} from 'components/shared/table/formatters';
import { useDeliveries } from 'query/deliveries';
import { useTspLocations } from 'query/tsp';
import { useDirectory } from 'query/directory';

const colDefs: Array<ColDef> = [
  {
    field: 'Date',
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
    headerName: 'Date',
  },
  {
    field: 'DeliveryId',
    headerName: 'Id',
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'LocationObj.organization.name',
    headerName: 'TSP',
    wrapText: true,
    autoHeight: true,
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
  },
  {
    field: 'ServiceRequestorPartyDirectory.name',
    headerName: 'Requestor',
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'ReceivingPartyDirectory.name',
    headerName: 'Recipient',
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'LocationObj.locationName',
    headerName: 'Location',
    wrapText: true,
    autoHeight: true,
    sortable: true,
    filter: true,
    resizable: true,
    floatingFilter: true,
  },
  {
    field: 'NominatedQuantity',
    headerName: 'Nominated',
    flex: 1,
    sortable: true,
    valueFormatter: numberFormatter,
  },
  {
    field: 'ScheduledQuantity',
    headerName: 'Scheduled',
    flex: 1,
    sortable: true,
    valueFormatter: numberFormatter,
  },
  {
    field: 'ActualQuantity',
    headerName: 'Actual',
    flex: 1,
    sortable: true,
    valueFormatter: numberFormatter,
  },
  {
    field: 'Allocations',
    headerName: 'Allocated',
    valueGetter: ({ data }: ValueGetterParams) => {
      return data?.Allocations?.reduce(
        (acc: number, allocation: IDeliveryAllocation) =>
          acc + allocation.Quantity,
        0,
      );
    },
  },
  {
    field: 'DelviveryId',
    headerName: 'Actions',
    cellRenderer: DeliveryModalCellRenderer,
  },
  // {
  //   headerName: '',
  //   pinned: 'right',
  //   width: 65,
  //   cellRendererFramework: DialogCellRenderer,
  //   cellRendererParams: {
  //     renderContent: DeliveryDialog,
  //     maxWidth: 'lg',
  //   },
  // },
];

export const DeliveriesPage = () => {
  const { data: deliveries } = useDeliveries();
  const { data: directory } = useDirectory();
  const { data: locations } = useTspLocations();
  const rowData = useMemo(() => {
    const locationMap = keyBy(locations?.data || [], 'locationId');
    const directoryMap = keyBy(directory?.data || [], 'businessId');
    return deliveries?.data.map((item) => {
      const row = item;
      const existing = locationMap[item.DeliveryLocation];
      // @ts-ignore
      return {
        ...row,
        LocationObj: existing,
        ReceivingPartyDirectory: directoryMap[item.ReceivingParty],
        ServiceRequestorPartyDirectory:
          directoryMap[item.ServiceRequestorParty],
      };
    });
  }, [deliveries?.data, directory?.data, locations?.data]);
  return (
    <>
      <Typography level="h4" sx={{ marginBottom: 1 }}>
        Deliveries
      </Typography>
      <Card sx={{ paddingX: 0, paddingY: 0 }}>
        <DataGrid
          rowData={rowData}
          columnDefs={colDefs}
          getRowId={({ data: innerRowData }) => innerRowData.DeliveryId}
        />
      </Card>
    </>
  );
};
