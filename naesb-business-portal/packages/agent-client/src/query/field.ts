import { useAuth0 } from '@auth0/auth0-react';
import { IField } from '@naesb/aries-types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';

export const FIELDS_KEY = 'FIELDS';

const getFields = (cb: () => Promise<string>) => async () => {
  const token = await cb();
  const result = await axios.post<{
    data: Array<IField>;
    totalRecords: number;
  }>(
    '/api/core/v1/Fields/search',
    {},
    { headers: { authorization: `Bearer ${token}` } },
  );
  return result.data;
};

const createField = (cb: () => Promise<string>) => async (well: IField) => {
  const token = await cb();
  const result = await axios.post<IField, AxiosResponse<IField>>(
    '/api/core/v1/Fields',
    well,
    { headers: { authorization: `Bearer ${token}` } },
  );
  return result.data;
};

export const useFields = () => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: getFields(getAccessTokenSilently),
    queryKey: [FIELDS_KEY],
  });
};

export const useCreateField = (
  options?: Omit<UseMutationOptions<IField, AxiosError, IField>, 'mutationFn'>,
) => {
  const { getAccessTokenSilently } = useAuth0();
  const client = useQueryClient();
  return useMutation({
    ...options,
    // @ts-ignore
    mutationFn: (values) => createField(getAccessTokenSilently)(values),
    onSuccess: (args, vars, context) => {
      client.invalidateQueries({ queryKey: [FIELDS_KEY] });
      if (options?.onSuccess) {
        // @ts-ignore
        options?.onSuccess(args, vars, context);
      }
    },
  });
};
