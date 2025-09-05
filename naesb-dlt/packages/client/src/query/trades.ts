import {
  ITradeViewModel,
  IQueryResult,
  IUpdateTradeRequest,
} from '@naesb/dlt-model';
import { useQueryClient, UseQueryOptions } from 'react-query';
import { AxiosError } from 'axios';
import { useAuthorizedMutation } from './useAuthorizedMutation';
import {
  useAuthorizedQuery,
  useAuthorizedSearchQuery,
} from './useAuthorizedQuery';

export const TRADES_KEY = 'TRADES';

export const useTrades = (channelId: string) =>
  useAuthorizedQuery<Array<ITradeViewModel>, Array<any>>(
    [TRADES_KEY, channelId],
    `/api/ledger/v1/channels/${channelId}/trades`,
  );

// TODO Define query type
export const useSearchTrades = (
  params: any = {},
  options?: UseQueryOptions<
    IQueryResult<ITradeViewModel>,
    AxiosError,
    IQueryResult<ITradeViewModel>
  >,
) =>
  useAuthorizedSearchQuery<
    IQueryResult<ITradeViewModel>,
    any,
    IQueryResult<ITradeViewModel>
  >(
    [TRADES_KEY, 'search', params],
    `/api/ledger/v1/explorer/trades/search`,
    params,
    {
      ...(options || {}),
    },
  );

export const useTrade = (channelId: string, tradeId: string) =>
  useAuthorizedQuery<ITradeViewModel>(
    [TRADES_KEY, channelId, tradeId],
    `/api/ledger/v1/explorer/trades/${tradeId}`,
  );

export const useTradeHistory = (channelId: string, tradeId: string) =>
  useAuthorizedQuery<Array<ITradeViewModel>>(
    [TRADES_KEY, channelId, tradeId, 'history'],
    `/api/ledger/v1/channels/${channelId}/trades/${tradeId}/history`,
  );

export const useCreateTrade = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  return useAuthorizedMutation<
    ITradeViewModel & { ChannelId: string },
    ITradeViewModel
  >(({ ChannelId }) => `/api/ledger/v1/channels/${ChannelId}/trades`, {
    onSuccess: () => {
      queryClient.invalidateQueries([TRADES_KEY]);
      onSuccess();
    },
  });
};

export const useUpdateTrade = (channelId: string, tradeId: string) => {
  const queryClient = useQueryClient();
  // eslint-disable-next-line @typescript-eslint/ban-types
  return useAuthorizedMutation<IUpdateTradeRequest, {}>(
    `/api/ledger/v1/channels/${channelId}/trades/${tradeId}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([TRADES_KEY, channelId]);
      },
    },
  );
};
