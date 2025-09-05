import { Box, Button, Card, Typography, Divider } from '@mui/joy';
import { ColDef } from 'ag-grid-community';
import { DataGrid } from 'components/shared/table';
import { useParams } from '@tanstack/router';
import { useChannelTrades } from 'query/trade';
import { CreateTradeDialog } from 'components/shared/trade/Create';
import { useState } from 'react';
import {
  DealIdCellRenderer,
  StatusCellRenderer,
} from 'components/shared/table/cellRenderers';
import {
  dateFormatter,
  priceFormatter,
} from 'components/shared/table/formatters';
import { useBusiness } from 'query/directory';

const columnDefs: Array<ColDef> = [
  {
    field: 'DealId',
    headerName: 'Deal ID',
    sortable: true,
    filter: true,
    floatingFilter: true,
    cellRenderer: DealIdCellRenderer,
    cellRendererParams: {
      to: '/Businesses/$businessId/Trades/$tradeId/Details',
    },
  },
  {
    field: 'DeliveryPeriodStart',
    headerName: 'Start Date',
    flex: 1,
    sort: 'asc',
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
  },
  {
    field: 'DeliveryPeriodEnd',
    headerName: 'End Date',
    flex: 1,
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
  },
  {
    field: 'Type',
    headerName: 'Type',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },
  {
    headerName: 'Status',
    field: 'Status',
    sortable: true,
    filter: true,
    floatingFilter: true,
    cellRenderer: StatusCellRenderer,
  },
  {
    field: 'DeliveryLocation',
    headerName: 'Location',
    flex: 1,
    floatingFilter: true,
    filter: true,
  },
  {
    field: 'PriceType',
    headerName: 'Price',
    valueFormatter: priceFormatter,
    flex: 1,
  },
  {
    field: 'MaxDailyQuantity',
    headerName: 'Qty/Day',
    flex: 1,
  },
];

export const BusinessFacilitiesPage = () => {
  const { businessId } = useParams({ from: '/Businesses/$businessId' });
  const { data: directory } = useBusiness(businessId);
  const { data } = useChannelTrades(directory?.channel?.ChannelId);
  const [open, setOpen] = useState(false);
  return (
    <Card sx={{ paddingBottom: 0, paddingX: 0, marginTop: 2 }}>
      <Box mb={1} mx={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography level="title-md" sx={{ marginBottom: 1 }}>
            Facilities
          </Typography>
          <Button
            onClick={() => setOpen(true)}
            size="sm"
            variant="outlined"
            color="neutral"
          >
            Create Trade
          </Button>
        </Box>
        <Divider sx={{ marginTop: 2 }} />
      </Box>
      {directory?.channel ? (
        <CreateTradeDialog
          open={open}
          handleClose={() => setOpen(false)}
          channelId={directory?.channel?.ChannelId}
        />
      ) : undefined}

      <DataGrid rowData={data?.data} columnDefs={columnDefs} />
    </Card>
  );
};
