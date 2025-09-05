import {
  CreateCredentialDefinitionRequest,
  ICredentialDefinition,
} from '@naesb/aries-types';
import {
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import axios, { AxiosError, AxiosResponse } from 'axios';

export const CREDENTIAL_DEFINITIONS_KEY = 'CREDENTIAL_DEFINITIONS';

const getCredentialDefinitions = async () => {
  const result = await axios.get<{
    data: Array<ICredentialDefinition>;
    totalRecords: number;
  }>('/api/agent/v1/CredentialDefinitions');
  return result.data;
};

const createCredentialDefintion = async (
  req: CreateCredentialDefinitionRequest,
) => {
  const result = await axios.post<
    CreateCredentialDefinitionRequest,
    AxiosResponse<CreateCredentialDefinitionRequest>
  >('/api/agent/v1/CredentialDefinitions', req);
  return result.data;
};

export const useCredentialDefinitions = () => {
  return useQuery({
    queryFn: getCredentialDefinitions,
    queryKey: [CREDENTIAL_DEFINITIONS_KEY],
  });
};

export const useCreateCredentialDefinition = (
  options?: Omit<
    UseMutationOptions<
      CreateCredentialDefinitionRequest,
      AxiosError,
      CreateCredentialDefinitionRequest
    >,
    'mutationFn'
  >,
) => {
  const client = useQueryClient();
  return useMutation({
    ...options,
    mutationFn: createCredentialDefintion,
    onSuccess: (args, vars, context) => {
      client.invalidateQueries({ queryKey: [CREDENTIAL_DEFINITIONS_KEY] });
      if (options?.onSuccess) {
        // @ts-ignore
        options?.onSuccess(args, vars, context);
      }
    },
  });
};
