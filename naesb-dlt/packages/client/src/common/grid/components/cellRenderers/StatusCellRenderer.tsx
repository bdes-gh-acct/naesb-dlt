import { ICellRendererParams } from 'ag-grid-community';
import { forwardRef } from 'react';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { useCellRendererRef } from '@react/toolkit';
import { ChangeTypeStatuses } from '@naesb/dlt-model';
import { Tooltip } from '@mui/material';

export const StatusCellRenderer = forwardRef(
  (params: ICellRendererParams, ref) => {
    const { value } = useCellRendererRef<ICellRendererParams>(ref, params);
    const status = value
      ? ChangeTypeStatuses.find((changeType) => changeType.Code === value)
      : undefined;
    return status ? (
      <Tooltip title={status?.DisplayName}>
        <FiberManualRecordIcon color={status.Color as any} fontSize="small" />
      </Tooltip>
    ) : (
      <></>
    );
  },
);
