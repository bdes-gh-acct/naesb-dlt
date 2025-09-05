import { ICellRendererParams } from 'ag-grid-community';
import { forwardRef } from 'react';
import { useCellRendererRef } from '@react/toolkit';
import { Typography, Box } from '@mui/material';

export const PriceCellRenderer = forwardRef(
  (params: ICellRendererParams, ref) => {
    const { data } = useCellRendererRef<ICellRendererParams>(ref, params);
    return (
      <Box>
        <Typography sx={{ lineHeight: '20px' }}>{data.Price}</Typography>
        <Typography sx={{ fontSize: 12 }} color="textSecondary">
          {data.PriceType}
        </Typography>
      </Box>
    );
  },
);
