import { IConnection } from '@naesb/aries-types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { useSnackbar } from 'notistack';
import { DIRECTORY_KEY } from './directory';

export const CONNECTIONS_KEY = 'CONNECTIONS';

const getConnections = async () => {
  const result = await axios.get<{ data: Array<IConnection> }>(
    '/api/agent/v1/connections',
  );
  return result.data;
};

const createConnection = async (did: string) => {
  const result = await axios.post<{ did: string }, AxiosResponse<IConnection>>(
    '/api/agent/v1/connections/Invite',
    { did },
  );
  return result.data;
};

export const useConnections = () => {
  return useQuery({ queryFn: getConnections, queryKey: [CONNECTIONS_KEY] });
};

export const useCreateConnection = () => {
  const client = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: createConnection,
    onSuccess: async () => {
      enqueueSnackbar({
        variant: 'success',
        message: 'Connection created successfully',
      });
      await setTimeout(() => {
        client.invalidateQueries([CONNECTIONS_KEY]);
        client.invalidateQueries([DIRECTORY_KEY]);
      }, 500);
    },
  });
};
