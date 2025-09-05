import { ChangeTypeStatuses, ITradeViewModel } from '@naesb/dlt-model';
import { FC } from 'react';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { Skeleton, Typography } from '@mui/material';

export interface StatusProps {
  trade?: ITradeViewModel;
}

export const Status: FC<StatusProps> = ({ trade }) => {
  const status = trade
    ? ChangeTypeStatuses.find((changeType) => changeType.Code === trade.Status)
    : undefined;
  return (
    <>
      {status && (
        <FiberManualRecordIcon
          // @ts-ignore
          color={status.Color}
          fontSize="small"
          sx={{ marginRight: 0.5 }}
        />
      )}
      <Typography sx={{ lineHeight: '24px' }}>
        {status ? status.DisplayName : <Skeleton width={80} />}
      </Typography>
    </>
  );
};
