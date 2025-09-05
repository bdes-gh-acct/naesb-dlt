import {
  DialogTitle,
  DialogContent,
  Grid as MuiGrid,
  Typography,
} from '@mui/material';
import { useSearchTrades } from '@query/trades';
import { QueryOperator } from '@naesb/dlt-model';
import { formatDate } from '@react/toolkit';
import { FC } from 'react';
import { Allocations } from './Allocation';

export interface DeliveryDialogProps {
  data?: any;
}

export const DeliveryDialog: FC<DeliveryDialogProps> = ({ data }) => {
  const { data: trades } = useSearchTrades(
    {
      query: {
        DeliveryLocation: {
          type: QueryOperator.EQUALS,
          filter: data?.Location,
        },
        DeliveryPeriodStart: {
          type: QueryOperator.LESS_THAN_OR_EQUAL,
          filter: data?.Date,
        },
        DeliveryPeriodEnd: {
          type: QueryOperator.MORE_THAN_OR_EQUAL,
          filter: data?.Date,
        },
      },
    },
    { refetchOnWindowFocus: false },
  );
  return (
    <>
      <DialogTitle>Delivery Details</DialogTitle>
      <DialogContent>
        <MuiGrid container spacing={2}>
          <MuiGrid item xs>
            <Typography variant="overline" color="textSecondary">
              Date
            </Typography>
            <Typography>
              {formatDate(data?.Date, 'MMM d, yyyy', true)}
            </Typography>
          </MuiGrid>
          <MuiGrid item xs>
            <Typography variant="overline" color="textSecondary">
              Quantity
            </Typography>
            <Typography>{data?.ActualQuantity}</Typography>
          </MuiGrid>
          <MuiGrid item xs>
            <Typography variant="overline" color="textSecondary">
              Location
            </Typography>
            <Typography>{data?.Location}</Typography>
          </MuiGrid>
        </MuiGrid>
        <Typography variant="h6" sx={{ marginTop: 3, marginBottom: 1 }}>
          Allocations
        </Typography>
        {trades && <Allocations delivery={data} trades={trades?.data} />}
      </DialogContent>
    </>
  );
};
