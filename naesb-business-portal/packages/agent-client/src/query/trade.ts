import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import {
  ChangeTypeStatusCode,
  ICreateTradeRequest,
  ITrade,
  ITradeViewModel,
  IQueryResult,
  QueryFactoryParams,
  QueryOperator,
  Commodity,
} from '@naesb/dlt-model';
import { useAuth0 } from '@auth0/auth0-react';

export const TRADE_KEY = 'TRADES';

const getChannelTrades =
  (cb: () => Promise<string>) => async (channelId: string) => {
    const token = await cb();
    const result = await axios.post<IQueryResult<ITradeViewModel>>(
      `/api/ledger/v1/explorer/trades/search`,
      {
        query: {
          ChannelId: { filter: channelId, type: QueryOperator.EQUALS },
        },
      },
      { headers: { authorization: `Bearer ${token}` } },
    );
    return result.data;
  };

const getTrades =
  (cb: () => Promise<string>) =>
  async (options: QueryFactoryParams<ITradeViewModel>) => {
    const token = await cb();
    const result = await axios.post<IQueryResult<ITradeViewModel>>(
      `/api/ledger/v1/explorer/trades/search`,
      options,
      { headers: { authorization: `Bearer ${token}` } },
    );
    return result.data;
  };

const getTrade = (cb: () => Promise<string>) => async (tradeId: string) => {
  const token = await cb();
  const result = await axios.get<ITradeViewModel>(
    `/api/ledger/v1/explorer/trades/${tradeId}`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return result.data;
};

const createTrade =
  (cb: () => Promise<string>) =>
  async (channelId: string, trade: ICreateTradeRequest) => {
    const token = await cb();
    const result = await axios.post<
      { did: string },
      AxiosResponse<ITradeViewModel>
    >(`/api/ledger/v1/channels/${channelId}/trades`, trade, {
      headers: { authorization: `Bearer ${token}` },
    });
    return result.data;
  };

const acceptTrade =
  (cb: () => Promise<string>) => async (channelId: string, tradeId: string) => {
    const token = await cb();
    const result = await axios.post<
      { did: string },
      AxiosResponse<ITradeViewModel>
    >(
      `/api/ledger/v1/channels/${channelId}/trades/${tradeId}`,
      { ChangeType: ChangeTypeStatusCode.ACCEPT },
      {
        headers: { authorization: `Bearer ${token}` },
      },
    );
    return result.data;
  };

export const useChannelTrades = (channelId?: string) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: ({ queryKey }) =>
      getChannelTrades(getAccessTokenSilently)(queryKey[1] as string),
    queryKey: [TRADE_KEY, channelId],
    enabled: !!channelId,
  });
};

export const useSearchTrades = (
  options: QueryFactoryParams<ITradeViewModel>,
  enabled?: boolean,
) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: ({ queryKey }) =>
      getTrades(getAccessTokenSilently)(
        (queryKey[1] as { options: QueryFactoryParams<ITradeViewModel> })
          .options as QueryFactoryParams<ITradeViewModel>,
      ),
    queryKey: [TRADE_KEY, { options }],
    enabled,
  });
};

export const useTrade = (tradeId: string) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: ({ queryKey }) => getTrade(getAccessTokenSilently)(queryKey[1]),
    queryKey: [TRADE_KEY, tradeId],
  });
};

const getTradeHistory =
  (cb: () => Promise<string>) => async (channelId: string, tradeId: string) => {
    const token = await cb();
    const result = await axios.get<
      Array<{ timestamp: string; TxId: string; Data: ITrade }>
    >(`/api/ledger/v1/channels/${channelId}/trades/${tradeId}/history`, {
      headers: { authorization: `Bearer ${token}` },
    });
    return result.data;
  };

export const useTradeHistory = (tradeId: string, channelId?: string) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: ({ queryKey }) =>
      getTradeHistory(getAccessTokenSilently)(
        queryKey[1] as string,
        queryKey[2] as string,
      ),
    queryKey: [TRADE_KEY, channelId, tradeId, 'history'],
  });
};

export const useCreateTrade = (onSuccess: (values: any) => void) => {
  const { getAccessTokenSilently } = useAuth0();
  const client = useQueryClient();
  return useMutation({
    // @ts-ignore
    mutationFn: (values: ICreateTradeRequest & { ChannelId: string }) =>
      createTrade(getAccessTokenSilently)(values.ChannelId, {
        ...values,
        Commodity: Commodity.NATURAL_GAS,
      }),
    onSuccess: async (values: any) => {
      onSuccess(values);
      await setTimeout(() => {
        client.invalidateQueries([TRADE_KEY]);
      }, 500);
    },
  });
};

export const useReplyTrade = (onSuccess?: (values: any) => void) => {
  const { getAccessTokenSilently } = useAuth0();
  const client = useQueryClient();
  return useMutation({
    // @ts-ignore
    mutationFn: ({
      channelId,
      tradeId,
    }: {
      channelId: string;
      tradeId: string;
    }) => acceptTrade(getAccessTokenSilently)(channelId, tradeId),
    onSuccess: async (values: any) => {
      if (onSuccess) {
        onSuccess(values);
      }

      await setTimeout(() => {
        client.invalidateQueries([TRADE_KEY]);
      }, 500);
    },
  });
};
