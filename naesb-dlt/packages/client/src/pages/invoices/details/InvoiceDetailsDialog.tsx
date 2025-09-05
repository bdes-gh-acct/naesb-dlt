import { DialogTitle, DialogContent } from '@mui/material';
import {
  QueryOperator,
  IInvoiceDetail,
  ITradeViewModel,
} from '@naesb/dlt-model';
import { formatDate, Grid } from '@react/toolkit';
import { FC } from 'react';
import { useSearchAllocations } from '@query/allocations';
import { ColDef } from 'ag-grid-community';

export interface InvoiceDetailsDialogProps {
  data?: IInvoiceDetail & { Trade?: ITradeViewModel };
}

const colDefs: Array<ColDef> = [
  {
    field: 'Delivery.DeliveryId',
    headerName: 'Contract',
    flex: 1,
  },
  {
    field: 'Delivery.Location',
    headerName: 'Location',
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

export const InvoiceDetailsDialog: FC<InvoiceDetailsDialogProps> = ({
  data,
}) => {
  const { data: allocations } = useSearchAllocations(
    {
      query: {
        DealId: {
          type: QueryOperator.EQUALS,
          filter: data?.DealId,
        },
        Delivery: {
          Date: {
            type: QueryOperator.EQUALS,
            filter: data?.Date,
          },
        },
      },
    },
    { refetchOnWindowFocus: false },
  );
  return (
    <>
      <DialogTitle>
        Delivery Details for{' '}
        {`${data?.Trade?.OrgDealId} on ${formatDate(
          data?.Date,
          undefined,
          true,
        )}`}
      </DialogTitle>
      <DialogContent>
        <Grid
          columnDefs={colDefs}
          rowData={allocations?.data}
          gridId="channel-invoice-details-drilldown"
          persistState={false}
          getRowNodeId={(innerData) => innerData.AllocationId}
        />
      </DialogContent>
    </>
  );
};
