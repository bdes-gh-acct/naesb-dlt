import { ICellRendererParams } from 'ag-grid-community';
import { FC, forwardRef, useState } from 'react';
import { Button, Dialog, DialogProps } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/MoreVert';

import useCellRendererRef from '../../useCellRendererRef';

export type DialogCellParams = {
  renderContent: FC<{ data: any; value: any }>;
  maxWidth: DialogProps['maxWidth'];
};

export type DialogCellRendererParams = ICellRendererParams & DialogCellParams;

export const DialogCellRenderer = forwardRef(
  (params: DialogCellRendererParams, ref) => {
    const {
      value,
      data,
      renderContent: Child,
      node,
      maxWidth = 'md',
    } = useCellRendererRef<DialogCellRendererParams>(ref, params);
    const [open, setOpen] = useState(false);
    return node.group ? (
      <>{value}</>
    ) : (
      <>
        {data && (
          <>
            <Button
              size="small"
              variant="outlined"
              onClick={() => setOpen(true)}
              sx={{
                paddingX: 0,
                minWidth: 48,
                borderColor: 'divider',
              }}
              color="inherit"
            >
              <VisibilityOutlinedIcon />
            </Button>
            <Dialog
              open={open}
              onClose={() => setOpen(false)}
              fullWidth
              maxWidth={maxWidth}
            >
              <Child data={data} value={value} />
            </Dialog>
          </>
        )}
      </>
    );
  },
);
