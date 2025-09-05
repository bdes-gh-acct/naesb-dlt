import { ICellRendererParams } from 'ag-grid-community';
import { forwardRef, useState } from 'react';
import { Button, Box } from '@mui/joy';
import { DeliveryModal } from 'components/shared/delivery/allocation';
import VisibilityOutlinedIcon from '@mui/icons-material/MoreVert';
import { useCellRendererRef } from '../hooks';

export const DeliveryModalCellRenderer = forwardRef(
  (params: ICellRendererParams, ref) => {
    const { value, data, node } = useCellRendererRef<ICellRendererParams>(
      ref,
      params,
    );
    const [open, setOpen] = useState(false);
    return node.group ? (
      <>{value}</>
    ) : (
      <>
        {data ? (
          <Box
            width="100%"
            height="100%"
            display="flex"
            alignItems="center"
            ref={ref}
          >
            <Button
              size="sm"
              onClick={() => setOpen(true)}
              color="neutral"
              variant="plain"
            >
              <VisibilityOutlinedIcon />
            </Button>
            <DeliveryModal
              open={open}
              handleClose={() => setOpen(false)}
              delivery={data}
            />
          </Box>
        ) : undefined}
      </>
    );
  },
);
