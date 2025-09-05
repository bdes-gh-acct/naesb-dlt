import { Alert, Box, Button, Typography } from '@mui/joy';
import { ITradeViewModel } from '@naesb/dlt-model';
import { useReplyTrade } from 'query/trade';

export interface ReplyTradeProps {
  trade: ITradeViewModel;
}

export const ReplyTrade = ({ trade }: ReplyTradeProps) => {
  const { mutateAsync } = useReplyTrade();
  return (
    <Alert
      variant="outlined"
      color="primary"
      endDecorator={
        <Box display="flex">
          <Button
            size="sm"
            variant="outlined"
            color="neutral"
            sx={{ marginRight: 1 }}
            onClick={() => {
              mutateAsync({
                channelId: trade.ChannelId,
                tradeId: trade.DealId,
              });
            }}
          >
            Accept
          </Button>
          <Button size="sm" variant="outlined" color="neutral">
            Reject
          </Button>
        </Box>
      }
    >
      <Box>
        <Typography level="body-lg">Action Required</Typography>
        <Typography level="body-sm">
          Please review the trade information and select Accept or Reject.
          Trades can also be revised by updating the details below.
        </Typography>
      </Box>
    </Alert>
  );
};
