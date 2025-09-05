import { useAuth0 } from '@auth0/auth0-react';
import { IQueryResult, ITspLocation, QueryOperator } from '@naesb/dlt-model';
import axios, { AxiosError } from 'axios';
import { isNil } from 'lodash';
import {
  useQuery,
  UseQueryOptions,
  UseQueryResult,
} from '@tanstack/react-query';

const getRegistryUrl = () => {
  const host = window.origin
    .toLowerCase()
    .replace('https://', '')
    .replace('http://', '');
  const parts = host.split('.');
  const isProd = host.split('.').length === 3;
  return isProd
    ? 'https://registry.naesbdlt.org'
    : `https://registry.${parts[1] || 'dev'}.naesbdlt.org`;
};

const TSP_KEY = 'TSP';

export const useTsps = <
  Response = IQueryResult<{ businessId: string; name: string }>,
  Select = Response,
  Error = AxiosError,
>(
  options?: UseQueryOptions<Response, Error, Select>,
) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery<Response, Error, Select>(
    [TSP_KEY],
    async () => {
      return (
        await axios.post(
          `${getRegistryUrl()}/api/saas/v1/organizations/search`,
          {
            query: {
              roles: {
                businessRoleId: {
                  filter: 3,
                  type: QueryOperator.EQUALS,
                },
              },
            },
          },
          {
            headers: {
              authorization: `Bearer ${await getAccessTokenSilently()}`,
            },
          },
        )
      ).data;
    },
    options,
  );
};

export const getTspLocation =
  (cb: () => Promise<string>) => async (locationId: string) => {
    const token = await cb();
    const result = await axios.get<ITspLocation>(
      `${getRegistryUrl()}/api/saas/v1/locations/${locationId}`,
      { headers: { authorization: `Bearer ${token}` } },
    );
    return result.data;
  };

export const useTspLocations = <
  Response = IQueryResult<ITspLocation>,
  Select = Response,
  Error = AxiosError,
>(
  tsp?: string,
  options?: UseQueryOptions<
    Response,
    Error,
    Select,
    [string, { tsp?: string }]
  >,
): UseQueryResult<Select, Error> => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery<Response, Error, Select, [string, { tsp?: string }]>(
    [TSP_KEY, { tsp }],
    async ({ queryKey }) => {
      const tspId = queryKey[1].tsp;
      return (
        await axios.post(
          `${getRegistryUrl()}/api/saas/v1/locations/search`,
          !isNil(tspId) && tspId.length
            ? {
                query: {
                  businessId: {
                    filter: Number(tsp),
                    type: QueryOperator.EQUALS,
                  },
                },
              }
            : { query: {} },
          {
            headers: {
              authorization: `Bearer ${await getAccessTokenSilently()}`,
            },
          },
        )
      ).data;
    },
    options,
  );
};

export const useTspLocation = <
  Response = ITspLocation,
  Select = Response,
  Error = AxiosError,
>(
  locationId: string,
  options?: UseQueryOptions<
    Response,
    Error,
    Select,
    [string, { tsp?: string }]
  >,
): UseQueryResult<Select, Error> => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery<Response, Error, Select, [string, string]>({
    ...options,
    // @ts-ignore
    queryKey: [TSP_KEY, locationId],
    queryFn: async ({ queryKey }: { queryKey: [string, string] }) => {
      const id = queryKey[1];
      return getTspLocation(getAccessTokenSilently)(id);
    },
  });
};
