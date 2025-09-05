import { useAuth0 } from '@auth0/auth0-react';
import { IQueryResult, ITspLocation, QueryOperator } from '@naesb/dlt-model';
import axios, { AxiosError } from 'axios';
import { isNil } from 'lodash';
import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';

const TSP_KEY = 'TSP';

export const useTsps = <Response, Select = Response, Error = AxiosError>(
  options?: UseQueryOptions<Response, Error, Select>,
) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery<Response, Error, Select>(
    [TSP_KEY],
    async () => {
      return (
        await axios.post(
          `https:/registry.dev.naesbdlt.org/api/saas/v1/tsps/search`,
          {},
          {
            headers: {
              authorization: `Bearer ${await getAccessTokenSilently()}`,
            },
          },
        )
      ).data.data;
    },
    options,
  );
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
          `https:/registry.dev.naesbdlt.org/api/saas/v1/locations/search`,
          !isNil(tspId) && tspId.length
            ? {
                query: {
                  Tsp: { filter: Number(tsp), type: QueryOperator.EQUALS },
                },
              }
            : {},
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
