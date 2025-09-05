import { useAuth0 } from '@auth0/auth0-react';
import {
  IPriceIndex,
  IPriceIndexProvider,
  IQueryResult,
} from '@naesb/dlt-model';
import axios, { AxiosError } from 'axios';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

const PRICE_KEY = 'PRICE';

export const usePriceIndexProviders = <
  Select = Array<IPriceIndexProvider>,
  Error = AxiosError,
>(
  options?: UseQueryOptions<
    Array<IPriceIndexProvider>,
    Error,
    Select,
    [string, string]
  >,
) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery<Array<IPriceIndexProvider>, Error, Select, [string, string]>(
    [PRICE_KEY, 'PROVIDERS'],
    async () => {
      return (
        await axios.post<IQueryResult<IPriceIndexProvider>>(
          `https:/registry.dev.naesbdlt.org/api/saas/v1/providers/search`,
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

export const usePriceIndices = <
  Select = IQueryResult<IPriceIndex>,
  Error = AxiosError,
>(
  options?: UseQueryOptions<
    IQueryResult<IPriceIndex>,
    Error,
    Select,
    [string, string]
  >,
) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery<IQueryResult<IPriceIndex>, Error, Select, [string, string]>(
    [PRICE_KEY, 'INDICES'],
    async () => {
      return (
        await axios.post<IQueryResult<IPriceIndex>>(
          `https://registry.dev.naesbdlt.org/api/saas/v1/indices/search`,
          {},
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
