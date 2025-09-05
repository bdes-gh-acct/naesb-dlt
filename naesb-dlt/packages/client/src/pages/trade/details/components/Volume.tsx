import { ITradeViewModel } from '@query/trades';
import { PerformanceTypeCode } from '@naesb/dlt-model';
import { FC } from 'react';
import { Skeleton, Typography } from '@mui/material';

export interface VolumeProps {
  trade?: ITradeViewModel;
}

export const Volume: FC<VolumeProps> = ({ trade }) => {
  if (trade?.PerformanceType === PerformanceTypeCode.FIRM_FIXED) {
    return (
      <>
        <Typography variant="h3">
          {trade ? trade?.FFQty : <Skeleton />}
        </Typography>
        <Typography variant="overline" color="textSecondary">
          MMBTU/Day
        </Typography>
      </>
    );
  }
  if (trade?.PerformanceType === PerformanceTypeCode.FIRM_VARIABLE)
    return (
      <>
        <Typography variant="h3">
          {trade ? `${trade?.FVMinQty}-${trade.FVMaxQty}` : <Skeleton />}
        </Typography>
        <Typography variant="overline" color="textSecondary">
          MMBTU/Day
        </Typography>
      </>
    );
  return (
    <>
      <Typography variant="h3">
        {trade ? `UP TO ${trade.ITMaxQty}` : <Skeleton />}
      </Typography>
      <Typography variant="overline" color="textSecondary">
        MMBTU/Day
      </Typography>
    </>
  );
};
