import { ColDef } from 'ag-grid-community';
import { Card } from '@common/card';
import { useParams } from 'react-router-dom';
import { dateFormatter, Grid } from '@react/toolkit';
import { QueryOperator } from '@naesb/dlt-model';
import { useAllocations } from '@query/deliveries';

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
    field: 'Quantity',
    headerName: 'Allocated',
    flex: 1,
  },
];

export const TradeDeliveriesGrid = () => {
  const { tradeId } = useParams<{ channelId: string; tradeId: string }>();
  const { data } = useAllocations({
    query: {
      DealId: {
        filter: tradeId,
        type: QueryOperator.EQUALS,
      },
    },
  });
  return (
    <Card title="Deliveries">
      <Grid
        columnDefs={colDefs}
        rowData={data?.data}
        gridId="channel-trades-deliveries"
        persistState={false}
        getRowNodeId={(innerData) => innerData.AllocationId}
      />
    </Card>
  );
};
