import { ICellRendererParams } from 'ag-grid-community';
import { forwardRef } from 'react';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import { ChangeTypeStatuses } from '@naesb/dlt-model';
import { Box } from '@mui/joy';
import { useCellRendererRef } from '../hooks';

export const StatusCellRenderer = forwardRef(
  (params: ICellRendererParams, ref) => {
    const { value } = useCellRendererRef<ICellRendererParams>(ref, params);
    const status = value
      ? ChangeTypeStatuses.find((changeType) => changeType.Code === value)
      : undefined;
    return status ? (
      <Box width="100%" height="100%" display="flex" alignItems="center">
        <FiberManualRecordIcon color={status.Color as any} fontSize="small" />
        <Box sx={{ marginLeft: 0.5 }}>{status.DisplayName}</Box>
      </Box>
    ) : (
      <></>
    );
  },
);
