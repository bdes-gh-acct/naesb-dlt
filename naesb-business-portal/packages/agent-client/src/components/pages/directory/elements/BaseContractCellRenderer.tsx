import { Box, Button } from '@mui/joy';
import { IDirectory } from '@naesb/dlt-model';
import { ICellRendererParams } from 'ag-grid-community';
import { useCellRendererRef } from 'components/shared/table/hooks';
import { forwardRef, useCallback } from 'react';
import { ScreenLoading } from 'components/shared/loader';
import { useCreateChannel, useReplyChannel } from 'query/channel';

export const BaseContractCellRenderer = forwardRef(
  (params: ICellRendererParams<IDirectory, string>, ref) => {
    const { data, value } = useCellRendererRef(ref, params);
    const { mutateAsync: createChannel, isLoading } = useCreateChannel();
    const { mutateAsync: replyChannel, isLoading: isReplyLoading } =
      useReplyChannel();
    const handleClick = useCallback(() => {
      if (data) {
        createChannel({
          // eslint-disable-next-line no-underscore-dangle
          CounterpartyEndpoint: data?.endpoint as string,
          Name: data?.name as string,
          CounterpartyId: data?.businessId as string,
        });
      }
    }, [createChannel, data]);

    const handleReply = useCallback(() => {
      if (data) {
        replyChannel({
          // eslint-disable-next-line no-underscore-dangle
          CounterpartyEndpoint: data?.endpoint as string,
          Response: 'Approve',
          ChannelId: data?.channel?.ChannelId as string,
        });
      }
    }, [replyChannel, data]);
    // eslint-disable-next-line react/jsx-no-useless-fragment
    // @ts-ignore
    if (!data?.connection) return <></>;
    // eslint-disable-next-line react/jsx-no-useless-fragment
    // @ts-ignore
    if (!value) {
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
              Invite
            </Button>
          </Box>
        </>
      );
    }
    if (value === 'Invitation Received') {
      return (
        <>
          <ScreenLoading loading={isReplyLoading} />
          <Box width="100%" height="100%" display="flex" alignItems="center">
            <Button
              onClick={handleReply}
              size="sm"
              variant="outlined"
              color="neutral"
            >
              Approve
            </Button>
          </Box>
        </>
      );
    }
    return <>{value}</>;
  },
);
