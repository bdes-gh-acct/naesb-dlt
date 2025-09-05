import { ColDef } from 'ag-grid-community';
import { Box, Card, Divider, Typography } from '@mui/joy';
import { useParams } from '@tanstack/router';
import { QueryOperator } from '@naesb/dlt-model';
import { useAllocations } from 'query/deliveries';
import { DataGrid } from 'components/shared/table';
import { dateFormatter } from 'components/shared/table/formatters';

const colDefs: Array<ColDef> = [
  {
    field: 'Delivery.Date',
    headerName: 'Date',
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
    flex: 1,
  },
  {
    field: 'Delivery.DeliveryId',
    headerName: 'Contract',
    flex: 1,
    floatingFilter: true,
  },
  {
    field: 'Delivery.NominatedQuantity',
    headerName: 'Nominated',
    flex: 1,
  },
  {
    field: 'Delivery.ScheduledQuantity',
    headerName: 'Scheduled',
    flex: 1,
  },
  {
    field: 'Delivery.ActualQuantity',
    headerName: 'Actual',
    flex: 1,
  },
  {
    field: 'Quantity',
    headerName: 'Allocated',
    flex: 1,
  },
];

export const TradeDeliveriesGrid = () => {
  const { tradeId } = useParams();
  const { data } = useAllocations({
    query: {
      DealId: {
        filter: tradeId,
        type: QueryOperator.EQUALS,
      },
    },
  });
  return (
    <Card sx={{ paddingX: 0, marginTop: 2, paddingTop: 2 }}>
      <Box mb={1} mx={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography level="title-md" sx={{ marginBottom: 1 }}>
            Deliveries
          </Typography>
        </Box>
        <Divider sx={{ marginTop: 1 }} />
      </Box>
      <DataGrid
        columnDefs={colDefs}
        rowData={data?.data}
        gridId="channel-trades-deliveries"
        getRowId={({ data: rowData }) => rowData.AllocationId}
      />
    </Card>
  );
};
