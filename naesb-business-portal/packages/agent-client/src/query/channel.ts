import { useAuth0 } from '@auth0/auth0-react';
import { IConnection } from '@naesb/aries-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IChannel } from '@naesb/dlt-model';
import { useSnackbar } from 'notistack';
import axios, { AxiosResponse } from 'axios';
import { DIRECTORY_KEY } from './directory';

export const CHANNELS_KEY = 'CHANNELS';

const getChannels = (cb: () => Promise<string>) => async () => {
  const token = await cb();
  const result = await axios.get<{ data: Array<IChannel> }>(
    '/api/ledger/v1/channels',
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return result.data;
};

const getChannel = (cb: () => Promise<string>) => async (id: string) => {
  const token = await cb();
  const result = await axios.get<IChannel>(`/api/ledger/v1/channels/${id}`, {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });
  return result.data;
};

const createChannel =
  (cb: () => Promise<string>) =>
  async ({
    CounterpartyId,
    Name,
    CounterpartyEndpoint,
  }: {
    CounterpartyId: string;
    CounterpartyEndpoint: string;
    Name: string;
  }) => {
    const token = await cb();
    const result = await axios.post<
      {
        CounterpartyId: string;
        CounterpartyEndpoint: string;
        Name: string;
      },
      AxiosResponse<IConnection>
    >(
      '/api/ledger/v1/channels',
      { CounterpartyId, Name, CounterpartyEndpoint },
      {
        headers: { authorization: `Bearer ${token}` },
      },
    );
    return result.data;
  };

const replyChannel =
  (cb: () => Promise<string>) =>
  async ({
    ChannelId,
    CounterpartyEndpoint,
    Response,
  }: {
    ChannelId: string;
    CounterpartyEndpoint?: string;
    Response: string;
  }) => {
    const token = await cb();
    const result = await axios.post<
      {
        CounterpartyId: string;
        CounterpartyEndpoint?: string;
        Name: string;
      },
      AxiosResponse<IConnection>
    >(
      '/api/ledger/v1/channels/reply',
      { ChannelId, CounterpartyEndpoint, Response },
      {
        headers: { authorization: `Bearer ${token}` },
      },
    );
    return result.data;
  };

export const useChannels = () => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: getChannels(getAccessTokenSilently),
    queryKey: [CHANNELS_KEY],
  });
};

export const useChannel = (id?: string) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: ({ queryKey }) =>
      getChannel(getAccessTokenSilently)(queryKey[1] as string),
    queryKey: [CHANNELS_KEY, id],
    enabled: !!id,
  });
};

export const useCreateChannel = () => {
  const client = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const { getAccessTokenSilently } = useAuth0();
  return useMutation({
    mutationFn: createChannel(getAccessTokenSilently),
    onSuccess: async () => {
      enqueueSnackbar({
        variant: 'success',
        message: 'Invitation sent',
      });
      setTimeout(() => {
        client.invalidateQueries([CHANNELS_KEY]);
        client.invalidateQueries([DIRECTORY_KEY]);
      }, 100);
    },
  });
};

export const useReplyChannel = () => {
  const client = useQueryClient();
  const { getAccessTokenSilently } = useAuth0();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: replyChannel(getAccessTokenSilently),
    onSuccess: async (_, variables) => {
      enqueueSnackbar({
        variant: 'success',
        message:
          variables.Response === 'Approve'
            ? 'Trade channel created'
            : 'Invitation Rejected',
      });
      setTimeout(() => {
        client.invalidateQueries([CHANNELS_KEY]);
        client.invalidateQueries([DIRECTORY_KEY]);
      }, 500);
    },
  });
};
