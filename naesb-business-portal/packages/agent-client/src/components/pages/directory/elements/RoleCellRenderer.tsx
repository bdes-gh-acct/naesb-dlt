import { ICellRendererParams } from 'ag-grid-community';
import { forwardRef } from 'react';
import { useCellRendererRef } from 'components/shared/table/hooks';
import { IDirectory } from '@naesb/dlt-model';
import { Box } from '@mui/joy';
import { Roles } from 'components/shared/roles';

export const RoleCellRenderer = forwardRef(
  // @ts-ignore
  (params: ICellRendererParams<IDirectory>, ref) => {
    const { value } = useCellRendererRef<ICellRendererParams<IDirectory>>(
      ref,
      params,
    );
    return (
      <Box
        display="flex"
        sx={{ lineHeight: 'normal' }}
        alignItems="center"
        width="100%"
        height="100%"
      >
        <Roles roles={value} />
      </Box>
    );
  },
);
