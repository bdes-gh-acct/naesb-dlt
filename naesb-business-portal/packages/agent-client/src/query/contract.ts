import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import {
  ChangeTypeStatusCode,
  ITradeViewModel,
  IQueryResult,
  QueryFactoryParams,
  QueryOperator,
  IBaseContract,
  Commodity,
} from '@naesb/dlt-model';
import { useAuth0 } from '@auth0/auth0-react';
import { useSnackbar } from 'notistack';

export const BASE_CONTRACT_KEY = 'BASE_CONTRACT';

const getChannelBaseContracts =
  (cb: () => Promise<string>) => async (channelId: string) => {
    const token = await cb();
    const result = await axios.post<IQueryResult<IBaseContract>>(
      `/api/ledger/v1/explorer/BaseContracts/search`,
      {
        query: {
          ChannelId: { filter: channelId, type: QueryOperator.EQUALS },
        },
      },
      { headers: { authorization: `Bearer ${token}` } },
    );
    return result.data;
  };

const getBaseContracts =
  (cb: () => Promise<string>) =>
  async (options: QueryFactoryParams<IBaseContract>) => {
    const token = await cb();
    const result = await axios.post<IQueryResult<IBaseContract>>(
      `/api/ledger/v1/explorer/BaseContracts/search`,
      options,
      { headers: { authorization: `Bearer ${token}` } },
    );
    return result.data;
  };

const createContract =
  (cb: () => Promise<string>) =>
  async (channelId: string, contract: IBaseContract) => {
    const token = await cb();
    const result = await axios.post<
      { did: string },
      AxiosResponse<IBaseContract>
    >(`/api/ledger/v1/channels/${channelId}/BaseContract`, contract, {
      headers: { authorization: `Bearer ${token}` },
    });
    return result.data;
  };

const reviseContract =
  (cb: () => Promise<string>) =>
  async (channelId: string, contract: IBaseContract) => {
    const token = await cb();
    const result = await axios.post<
      { did: string },
      AxiosResponse<IBaseContract>
    >(
      `/api/ledger/v1/channels/${channelId}/BaseContract/${contract.Commodity}`,
      contract,
      {
        headers: { authorization: `Bearer ${token}` },
      },
    );
    return result.data;
  };

const getBaseContract =
  (cb: () => Promise<string>) => async (commodity: Commodity) => {
    const token = await cb();
    const result = await axios.get<IBaseContract>(
      `/api/ledger/v1/explorer/BaseContract/${commodity}`,
      { headers: { authorization: `Bearer ${token}` } },
    );
    return result.data;
  };

const acceptContract =
  (cb: () => Promise<string>) =>
  async (channelId: string, commodity: Commodity) => {
    const token = await cb();
    const result = await axios.post<
      { did: string },
      AxiosResponse<ITradeViewModel>
    >(
      `/api/ledger/v1/channels/${channelId}/BaseContract/${commodity}/Accept`,
      { ChangeType: ChangeTypeStatusCode.ACCEPT },
      {
        headers: { authorization: `Bearer ${token}` },
      },
    );
    return result.data;
  };

export const useChannelBaseContract = (channelId?: string) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: ({ queryKey }) =>
      getChannelBaseContracts(getAccessTokenSilently)(queryKey[1] as string),
    queryKey: [BASE_CONTRACT_KEY, channelId],
    enabled: !!channelId,
  });
};

export const useSearchBaseContracts = (
  options: QueryFactoryParams<IBaseContract>,
  enabled?: boolean,
) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: ({ queryKey }) =>
      getBaseContracts(getAccessTokenSilently)(
        (queryKey[1] as { options: QueryFactoryParams<IBaseContract> })
          .options as QueryFactoryParams<IBaseContract>,
      ),
    queryKey: [BASE_CONTRACT_KEY, { options }],
    enabled,
  });
};

export const useBaseContract = (commodity: Commodity) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: ({ queryKey }) =>
      getBaseContract(getAccessTokenSilently)(queryKey[1] as Commodity),
    queryKey: [BASE_CONTRACT_KEY, commodity],
  });
};

export const useCreateBaseContract = (onSuccess: (values: any) => void) => {
  const { getAccessTokenSilently } = useAuth0();
  const client = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    // @ts-ignore
    mutationFn: (values: IBaseContract & { ChannelId: string }) =>
      createContract(getAccessTokenSilently)(values.ChannelId, values),
    onSuccess: async (values: any) => {
      enqueueSnackbar({
        variant: 'success',
        message: 'Base contract initiated',
      });
      onSuccess(values);
      await setTimeout(() => {
        client.invalidateQueries([BASE_CONTRACT_KEY]);
      }, 500);
    },
  });
};

export const useReviseBaseContract = (onSuccess: (values: any) => void) => {
  const { getAccessTokenSilently } = useAuth0();
  const client = useQueryClient();
  return useMutation({
    // @ts-ignore
    mutationFn: (values: IBaseContract & { ChannelId: string }) =>
      reviseContract(getAccessTokenSilently)(values.ChannelId, values),
    onSuccess: async (values: any) => {
      onSuccess(values);
      await setTimeout(() => {
        client.invalidateQueries([BASE_CONTRACT_KEY]);
      }, 500);
    },
  });
};

export const useAcceptContract = (onSuccess?: (values: any) => void) => {
  const { getAccessTokenSilently } = useAuth0();
  const client = useQueryClient();
  return useMutation({
    // @ts-ignore
    mutationFn: ({
      channelId,
      commodity,
    }: {
      channelId: string;
      commodity: Commodity;
    }) => acceptContract(getAccessTokenSilently)(channelId, commodity),
    onSuccess: async (values: any) => {
      if (onSuccess) {
        onSuccess(values);
      }

      await setTimeout(() => {
        client.invalidateQueries([BASE_CONTRACT_KEY]);
      }, 500);
    },
  });
};
