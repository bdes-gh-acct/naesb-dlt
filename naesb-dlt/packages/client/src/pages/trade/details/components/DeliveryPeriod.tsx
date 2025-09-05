import { ITradeViewModel } from '@query/trades';
import { FC } from 'react';
import { Typography } from '@mui/material';
import { formatDate } from '@react/toolkit';

export interface StatusProps {
  trade: ITradeViewModel;
}

export const DeliveryPeriod: FC<StatusProps> = ({ trade }) => {
  return (
    <Typography>
      {trade.DeliveryPeriodStart === trade.DeliveryPeriodEnd
        ? formatDate(trade.DeliveryPeriodStart, undefined, true)
        : `${formatDate(
            trade.DeliveryPeriodStart,
            undefined,
            true,
          )} - ${formatDate(trade.DeliveryPeriodEnd, undefined, true)}`}
    </Typography>
  );
};
