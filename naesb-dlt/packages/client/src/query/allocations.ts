import { IDeliveryAllocation, IQueryResult } from '@naesb/dlt-model';
import { UseQueryOptions } from 'react-query';
import { AxiosError } from 'axios';
import {
  useAuthorizedQuery,
  useAuthorizedSearchQuery,
} from './useAuthorizedQuery';

export const ALLOCATIONS_KEY = 'ALLOCATIONS';

export const useAllocations = (channelId: string) =>
  useAuthorizedQuery<Array<IDeliveryAllocation>, Array<any>>(
    [ALLOCATIONS_KEY, channelId],
    `/api/ledger/v1/channels/${channelId}/allocations`,
  );

// TODO Define query type
export const useSearchAllocations = (
  params: any = {},
  options?: UseQueryOptions<
    IQueryResult<IDeliveryAllocation>,
    AxiosError,
    IQueryResult<IDeliveryAllocation>
  >,
) =>
  useAuthorizedSearchQuery<IQueryResult<IDeliveryAllocation>>(
    [ALLOCATIONS_KEY, 'search', params],
    `/api/ledger/v1/explorer/allocations/search`,
    params,
    {
      ...(options || {}),
    },
  );
