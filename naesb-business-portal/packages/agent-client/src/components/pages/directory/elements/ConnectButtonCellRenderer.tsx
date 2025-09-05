import { Box, Button, Typography } from '@mui/joy';
import { IDirectory } from '@naesb/dlt-model';
import { ICellRendererParams } from 'ag-grid-community';
import { useCellRendererRef } from 'components/shared/table/hooks';
import { useCreateConnection } from 'query/connections';
import { forwardRef, useCallback } from 'react';
import ConnectIcon from '@mui/icons-material/PersonAddOutlined';
import { ScreenLoading } from 'components/shared/loader';

export const ConnectButtonCellRenderer = forwardRef(
  (params: ICellRendererParams<IDirectory, string>, ref) => {
    const { value, data } = useCellRendererRef(ref, params);
    const { mutateAsync, isLoading } = useCreateConnection();
    const handleClick = useCallback(() => {
      mutateAsync(value as any);
    }, [value, mutateAsync]);
    // @ts-ignore
    if (!data || !value || !data?.verKey) return <></>;
    // eslint-disable-next-line react/jsx-no-useless-fragment
    // @ts-ignore
    if (data.connection)
      return (
        <Box width="100%" height="100%" display="flex" alignItems="center">
          <Typography color="success">Connected</Typography>
        </Box>
      );

    return (
      <>
        <ScreenLoading loading={isLoading} />
        <Box width="100%" height="100%" display="flex" alignItems="center">
          <Button
            onClick={handleClick}
            size="sm"
            variant="outlined"
            color="neutral"
          >
            <ConnectIcon />
          </Button>
        </Box>
      </>
    );
  },
);
