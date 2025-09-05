import { useAuth0 } from '@auth0/auth0-react';
import {
  QueryKey,
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from 'react-query';
import axios, { AxiosError } from 'axios';

export const useAuthorizedQuery = <
  Response,
  Select = Response,
  Error = AxiosError,
>(
  key: string | Array<string>,
  route: string,
  options?: UseQueryOptions<Response, Error, Select>,
) => {
  const { getAccessTokenSilently, user } = useAuth0();
  return useQuery<Response, Error, Select>(
    key,
    async () => {
      return (
        await axios.get<Response>(route, {
          headers: {
            authorization: `Bearer ${await getAccessTokenSilently()}`,
            'x-org-id': user?.org_id,
          },
        })
      ).data;
    },
    options,
  );
};

export const useAuthorizedSearchQuery = <
  Response,
  // eslint-disable-next-line @typescript-eslint/ban-types
  Body = {},
  Select = Response,
  Error = AxiosError,
>(
  key: QueryKey,
  route: string,
  body?: Body,
  options?: UseQueryOptions<Response, Error, Select>,
): UseQueryResult<Select, Error> => {
  const { getAccessTokenSilently, user } = useAuth0();
  return useQuery<Response, Error, Select>(
    key,
    async () => {
      return (
        await axios.post<Response>(route, body, {
          headers: {
            authorization: `Bearer ${await getAccessTokenSilently()}`,
            'x-org-id': user?.org_id,
          },
        })
      ).data;
    },
    options,
  );
};
