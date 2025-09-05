import { formatStatus } from '@common/grid';
import {
  DialogContent,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useTransaction } from '@query/transactions';
import { formatDate } from '@react/toolkit';
import { FC, useMemo } from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useParams } from 'react-router';

export interface BlockDialogProps {
  value: string;
  data: any;
}

export const BlockDialog: FC<BlockDialogProps> = ({ value: txId, data }) => {
  const { channelId } = useParams<any>();
  const { data: block } = useTransaction(channelId, txId);
  const transaction = useMemo(
    () =>
      block?.data.data.find(
        (tx: any) => tx?.payload.header.channel_header.tx_id === txId,
      ),
    [block?.data.data, txId],
  );
  return (
    <>
      <DialogTitle>TRANSACTION DETAILS</DialogTitle>
      <DialogContent>
        {transaction && (
          <List disablePadding>
            <ListItem disablePadding>
              <ListItemText primary="Transaction ID" secondary={txId} />
            </ListItem>{' '}
            <ListItem disablePadding>
              <ListItemText
                primary="Created By"
                secondary={
                  transaction?.payload.header.signature_header.creator.mspid
                }
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary="Timestamp"
                secondary={formatDate(
                  transaction?.payload.header.channel_header.timestamp,
                  'MMM dd, yyyy h:mm a',
                )}
              />
            </ListItem>
            <ListItem disablePadding>
              <ListItemText
                primary="Status"
                secondary={formatStatus(data.ITradeViewModel.Status)}
              />
            </ListItem>
          </List>
        )}
      </DialogContent>
    </>
  );
};
