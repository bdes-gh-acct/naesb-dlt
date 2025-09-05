import { useAuth0 } from '@auth0/auth0-react';
import { IWell } from '@naesb/aries-types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';

export const WELLS_KEY = 'WELLS';

const getWells = (cb: () => Promise<string>) => async () => {
  const token = await cb();
  const result = await axios.post<{ data: Array<IWell>; totalRecords: number }>(
    '/api/core/v1/Wells/search',
    {},
    { headers: { authorization: `Bearer ${token}` } },
  );
  return result.data;
};

const createWell = (cb: () => Promise<string>) => async (well: IWell) => {
  const token = await cb();
  const result = await axios.post<IWell, AxiosResponse<IWell>>(
    '/api/core/v1/Wells',
    well,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return result.data;
};

export const useWells = () => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: getWells(getAccessTokenSilently),
    queryKey: [WELLS_KEY],
  });
};

export const useCreateWell = (
  options?: Omit<UseMutationOptions<IWell, AxiosError, IWell>, 'mutationFn'>,
) => {
  const { getAccessTokenSilently } = useAuth0();
  const client = useQueryClient();
  return useMutation({
    ...options,
    // @ts-ignore
    mutationFn: (values) => createWell(getAccessTokenSilently)(values),
    onSuccess: (args, vars, context) => {
      client.invalidateQueries({ queryKey: [WELLS_KEY] });
      if (options?.onSuccess) {
        // @ts-ignore
        options?.onSuccess(args, vars, context);
      }
    },
  });
};
