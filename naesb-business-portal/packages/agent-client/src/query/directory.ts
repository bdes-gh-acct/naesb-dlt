import { useAuth0 } from '@auth0/auth0-react';
import { IDirectory } from '@naesb/dlt-model';
import { useQuery } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

export const DIRECTORY_KEY = 'DIRECTORY';

const getDirectory = (cb: () => Promise<string>) => async () => {
  const token = await cb();
  const result = await axios.get<{ data: Array<IDirectory> }>(
    '/api/core/v1/Directory',
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  return result.data;
};

const getBusiness =
  (cb: () => Promise<string>) => async (businessId: string) => {
    const token = await cb();
    const result = await axios.get<IDirectory>(
      `/api/core/v1/Directory/${businessId}`,
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    return result.data;
  };

export const useDirectory = () => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: getDirectory(getAccessTokenSilently),
    queryKey: [DIRECTORY_KEY],
  });
};

export const useBusiness = (businessId: string) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery<IDirectory, AxiosError, IDirectory, [string, string]>({
    queryFn: ({ queryKey }) => getBusiness(getAccessTokenSilently)(queryKey[1]),
    queryKey: [DIRECTORY_KEY, businessId],
  });
};
