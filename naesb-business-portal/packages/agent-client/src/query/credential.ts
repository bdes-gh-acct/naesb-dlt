import { CreateCredentialDefinitionRequest } from '@naesb/aries-types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';

export const CREDENTIALS_KEY = 'CREDENTIALS';

const getIssuedCredentials = async () => {
  const result = await axios.post<{
    data: Array<any>;
    totalRecords: number;
  }>('/api/agent/v1/Credentials/Issued/Search');
  return result.data;
};

const createCredential = async (req: any) => {
  const result = await axios.post('/api/agent/v1/Credentials', req);
  return result.data;
};

export const useCredentials = () => {
  return useQuery({
    queryFn: getIssuedCredentials,
    queryKey: [CREDENTIALS_KEY],
  });
};

export const useCreateCredential = (
  options?: Omit<
    UseMutationOptions<any, AxiosError, CreateCredentialDefinitionRequest>,
    'mutationFn'
  >,
) => {
  const client = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: createCredential,
    onSuccess: (args, vars, context) => {
      client.invalidateQueries({ queryKey: [CREDENTIALS_KEY] });
      if (options?.onSuccess) {
        // @ts-ignore
        options?.onSuccess(args, vars, context);
      }
    },
  });
};
