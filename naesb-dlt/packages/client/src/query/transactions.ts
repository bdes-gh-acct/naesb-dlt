import { ITradeViewModel } from '@naesb/dlt-model';
import {
  useAuthorizedQuery,
  useAuthorizedSearchQuery,
} from './useAuthorizedQuery';

export const TRANSACTIONS_KEY = 'TRANSACTIONS';
export const EXPLORER_KEY = 'EXPLORER';

export const useTransaction = (channelId: string, txId: string) =>
  useAuthorizedQuery<ITradeViewModel, any>(
    [TRANSACTIONS_KEY, channelId, txId],
    `/api/ledger/v1/channels/${channelId}/transactions/${txId}`,
  );

export const useExplorerTransactions = () =>
  useAuthorizedSearchQuery<
    { channels: Array<{ channel_id: string }> },
    undefined
  >(
    [EXPLORER_KEY, TRANSACTIONS_KEY],
    '/api/ledger/v1/explorer/transactions/search',
  );
