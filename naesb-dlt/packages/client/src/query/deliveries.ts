import {
  ICreateDeliveryAllocationRequest,
  ICreateDeliveryRequest,
  IDeliveryAllocation,
  IDelivery,
  IQueryResult,
  QueryFactoryParams,
} from '@naesb/dlt-model';
import { useQueryClient } from 'react-query';
import { useAuthorizedMutation } from './useAuthorizedMutation';
import { useAuthorizedSearchQuery } from './useAuthorizedQuery';

export const DELIVERIES_KEY = 'DELIVERIES';

export const useDeliveries = (params: QueryFactoryParams<IDelivery> = {}) =>
  useAuthorizedSearchQuery<IQueryResult<IDelivery>>(
    [DELIVERIES_KEY, params],
    `/api/ledger/v1/explorer/deliveries/search`,
  );

export const useAllocations = (
  params: QueryFactoryParams<IDeliveryAllocation> = {},
) =>
  useAuthorizedSearchQuery<IQueryResult<IDeliveryAllocation>>(
    [DELIVERIES_KEY, params],
    `/api/ledger/v1/explorer/allocations/search`,
    params,
  );

export const useCreateAllocation = (channelId: string) => {
  const queryClient = useQueryClient();
  return useAuthorizedMutation<
    ICreateDeliveryAllocationRequest,
    IDeliveryAllocation
  >(`/api/ledger/v1/channels/${channelId}/allocations`, {
    onSuccess: () => {
      queryClient.invalidateQueries([DELIVERIES_KEY]);
    },
  });
};

export const useUpdateAllocation = (channelId: string) => {
  const queryClient = useQueryClient();
  return useAuthorizedMutation<
    ICreateDeliveryAllocationRequest,
    IDeliveryAllocation
  >(
    ({ DealId, DeliveryId }) =>
      `/api/ledger/v1/channels/${channelId}/allocations/${DeliveryId}_${DealId}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([DELIVERIES_KEY]);
      },
    },
  );
};

export const useCreateDelivery = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  return useAuthorizedMutation<
    ICreateDeliveryRequest & { ChannelId: string },
    IDelivery
  >(({ ChannelId }) => `/api/ledger/v1/channels/${ChannelId}/deliveries`, {
    onSuccess: () => {
      queryClient.invalidateQueries([DELIVERIES_KEY]);
      onSuccess();
    },
  });
};
