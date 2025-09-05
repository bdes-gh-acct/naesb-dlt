import { useAuth0 } from '@auth0/auth0-react';
import { useMutation, UseMutationOptions } from 'react-query';
import axios, { AxiosError } from 'axios';

export const useAuthorizedMutation = <Input, Response>(
  route: string | ((input: Input) => string),
  options?: UseMutationOptions<Response, AxiosError, Input>,
  method?: 'patch' | 'delete' | 'post',
) => {
  const { getAccessTokenSilently, user } = useAuth0();
  return useMutation<Response, AxiosError, Input>(async (value: Input) => {
    const url = typeof route === 'string' ? route : route(value);
    const headers = {
      authorization: `Bearer ${await getAccessTokenSilently()}`,
      'x-org-id': user?.org_id,
    };

    switch (method?.toLowerCase()) {
      case 'patch':
        return (await axios.patch(url, value, { headers })).data;

      case 'delete':
        return (await axios.delete(url, { headers })).data;

      default:
        return (await axios.post(url, value, { headers })).data;
    }
  }, options);
};
