import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemDecorator,
  ListItemContent,
} from '@mui/joy';
import { IDirectory } from '@naesb/dlt-model';
import CheckIcon from '@mui/icons-material/Check';
import { useCallback } from 'react';
import { useCreateChannel, useReplyChannel } from 'query/channel';

export interface ChannelStepCardProps {
  directory: IDirectory;
}

export const ChannelStepCard = ({ directory }: ChannelStepCardProps) => {
  const { mutateAsync: createChannel, isLoading: isInviting } =
    useCreateChannel();
  const { mutateAsync: replyChannel, isLoading: isReplyLoading } =
    useReplyChannel();
  const handleClick = useCallback(() => {
    if (!directory?.channel) {
      createChannel({
        // eslint-disable-next-line no-underscore-dangle
        CounterpartyEndpoint: directory?.endpoint as string,
        Name: directory?.name as string,
        CounterpartyId: directory?.businessId as string,
      });
    } else if (directory?.channel?.Status === 'Invitation Received') {
      replyChannel({
        // eslint-disable-next-line no-underscore-dangle
        CounterpartyEndpoint: directory?.endpoint as string,
        Response: 'Approve',
        ChannelId: directory?.channel?.ChannelId as string,
      });
    }
  }, [createChannel, directory, replyChannel]);
  return (
    <Box display="flex" justifyContent="center">
      <Card size="lg" variant="outlined">
        <CardContent orientation="horizontal">
          <CardContent>
            <Typography level="h3" sx={{ flex: 'auto', marginBottom: 1 }}>
              Create Trade Channel
            </Typography>
            <List
              sx={{
                '& > li': { alignItems: 'flex-start' },
                marginBottom: 0,
                paddingBottom: 0,
              }}
            >
              <ListItem>
                <ListItemDecorator>
                  <CheckIcon />
                </ListItemDecorator>
                <ListItemContent>
                  Access NAESB Standards and Base Contract
                </ListItemContent>
              </ListItem>
              <ListItem>
                <ListItemDecorator>
                  <CheckIcon />
                </ListItemDecorator>
                <ListItemContent>Execute Base Contract</ListItemContent>
              </ListItem>
              <ListItem>
                <ListItemDecorator>
                  <CheckIcon />
                </ListItemDecorator>
                <ListItemContent>Execute trades*</ListItemContent>
              </ListItem>
              <ListItem>
                <ListItemDecorator>
                  <CheckIcon />
                </ListItemDecorator>
                <ListItemContent>
                  Track nominations and schedule*
                </ListItemContent>
              </ListItem>
              <ListItem>
                <ListItemDecorator>
                  <CheckIcon />
                </ListItemDecorator>
                <ListItemContent>Create and send invoices*</ListItemContent>
              </ListItem>
            </List>
            <Typography level="body-xs" sx={{ paddingBottom: 1 }}>
              *Requires execution of NAESB DLT Base Contract
            </Typography>
            <Button
              onClick={handleClick}
              loading={isInviting || isReplyLoading}
              disabled={directory?.channel?.Status === 'Invitation Sent'}
            >
              {!directory?.channel
                ? 'Invite'
                : directory?.channel?.Status === 'Invitation Sent'
                ? 'Invitation Sent'
                : 'Accept Invitation'}
            </Button>
          </CardContent>
        </CardContent>
      </Card>
    </Box>
  );
};
