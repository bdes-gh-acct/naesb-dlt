import { useAuth0 } from '@auth0/auth0-react';
import { useMemo } from 'react';
import {
  IAllocateDeliveryRequest,
  ICreateDeliveryAllocationRequest,
  ICreateDeliveryRequest,
  IDeliveryAllocation,
  IDelivery,
  IQueryResult,
  QueryFactoryParams,
} from '@naesb/dlt-model';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useDirectory } from './directory';
import { useTspLocations } from './tsp';

export const DELIVERIES_KEY = 'DELIVERIES';

const getDeliveries =
  (cb: () => Promise<string>) =>
  async (params: QueryFactoryParams<IDelivery> = {}) => {
    const token = await cb();
    const result = await axios.post<IQueryResult<IDelivery>>(
      `/api/ledger/v1/explorer/deliveries/search`,
      params,
      { headers: { authorization: `Bearer ${token}` } },
    );
    return result.data;
  };

const getDelivery =
  (cb: () => Promise<string>) => async (deliveryId: string) => {
    const token = await cb();
    const result = await axios.get<IDelivery>(
      `/api/ledger/v1/explorer/deliveries/${deliveryId}`,
      { headers: { authorization: `Bearer ${token}` } },
    );
    return result.data;
  };

export const useDeliveries = (params?: QueryFactoryParams<IDelivery>) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: ({ queryKey }) =>
      getDeliveries(getAccessTokenSilently)(
        queryKey[1] as QueryFactoryParams<IDelivery>,
      ),
    queryKey: [DELIVERIES_KEY, params],
  });
};

export const useDelivery = (deliveryId: string) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: ({ queryKey }) =>
      getDelivery(getAccessTokenSilently)(queryKey[1] as string),
    queryKey: [DELIVERIES_KEY, deliveryId],
  });
};

export const useDecoratedDelivery = (deliveryId: string) => {
  const { data, isLoading, error } = useDelivery(deliveryId);
  const { data: directory } = useDirectory();
  const { data: tspLocations } = useTspLocations();
  const innerData = useMemo(() => {
    return data
      ? {
          ...data,
          _meta: {
            errors: false,
            Tsp: directory?.data?.find(
              (item) => item.businessId === data.TspBusinessId.toString(),
            ),
            ServiceRequestorParty: directory?.data.find(
              (item) => item.businessId === data.ServiceRequestorParty,
            ),
            ReceivingParty: directory?.data.find(
              (item) => item.businessId === data.ReceivingParty,
            ),
            Location: tspLocations?.data.find(
              (item) => item.locationId === data.DeliveryLocation,
            ),
          },
        }
      : undefined;
  }, [data, directory, tspLocations]);
  return { data: innerData, isLoading, error };
};

const getAllocations =
  (cb: () => Promise<string>) =>
  async (params: QueryFactoryParams<IDeliveryAllocation> = {}) => {
    const token = await cb();
    const result = await axios.post<IQueryResult<IDeliveryAllocation>>(
      `/api/ledger/v1/explorer/allocations/search`,
      params,
      { headers: { authorization: `Bearer ${token}` } },
    );
    return result.data;
  };

export const useAllocations = (
  params?: QueryFactoryParams<IDeliveryAllocation>,
) => {
  const { getAccessTokenSilently } = useAuth0();
  return useQuery({
    queryFn: ({ queryKey }) =>
      getAllocations(getAccessTokenSilently)(
        queryKey[2] as QueryFactoryParams<IDeliveryAllocation>,
      ),
    queryKey: [DELIVERIES_KEY, 'ALLOCATIONS', params],
  });
};

const createAllocation =
  (cb: () => Promise<string>) =>
  async (channelId: string, request: ICreateDeliveryAllocationRequest) => {
    const token = await cb();
    const result = await axios.post<
      ICreateDeliveryAllocationRequest,
      IDeliveryAllocation
    >(`/api/ledger/v1/channels/${channelId}/allocations`, request, {
      headers: { authorization: `Bearer ${token}` },
    });
    return result;
  };

export const useCreateAllocation = (
  channelId: string,
  onSuccess: (values: any) => void,
) => {
  const { getAccessTokenSilently } = useAuth0();
  const client = useQueryClient();
  return useMutation({
    // @ts-ignore
    mutationFn: (values: ICreateDeliveryAllocationRequest) =>
      createAllocation(getAccessTokenSilently)(channelId, values),
    onSuccess: async (values: any) => {
      onSuccess(values);
      await setTimeout(() => {
        client.invalidateQueries([DELIVERIES_KEY]);
      }, 500);
    },
  });
};

const updateAllocation =
  (cb: () => Promise<string>) =>
  async (channelId: string, request: ICreateDeliveryAllocationRequest) => {
    const token = await cb();
    const result = await axios.post<
      ICreateDeliveryAllocationRequest,
      IDeliveryAllocation
    >(
      `/api/ledger/v1/channels/${channelId}/allocations/${request.DeliveryId}_${request.DealId}`,
      request,
      {
        headers: { authorization: `Bearer ${token}` },
      },
    );
    return result;
  };

const allocate =
  (cb: () => Promise<string>) =>
  async (
    channelId: string,
    request: {
      DeliveryId: string;
      Allocations: Array<Omit<ICreateDeliveryAllocationRequest, 'DeliveryId'>>;
    },
  ) => {
    const token = await cb();
    const result = await axios.post<
      IAllocateDeliveryRequest,
      IAllocateDeliveryRequest
    >(
      `/api/ledger/v1/channels/${channelId}/deliveries/${request.DeliveryId}/allocate`,
      request,
      {
        headers: { authorization: `Bearer ${token}` },
      },
    );
    return result;
  };

export const useAllocateDelivery = (
  channelId: string,
  onSuccess: (values: any) => void,
) => {
  const { getAccessTokenSilently } = useAuth0();
  const client = useQueryClient();
  return useMutation({
    // @ts-ignore
    mutationFn: (values: IAllocateDeliveryRequest) =>
      allocate(getAccessTokenSilently)(channelId, values),
    onSuccess: async (values: any) => {
      onSuccess(values);
      await setTimeout(() => {
        client.invalidateQueries([DELIVERIES_KEY]);
      }, 500);
    },
  });
};

export const useUpdateAllocation = (
  channelId: string,
  onSuccess: (values: any) => void,
) => {
  const { getAccessTokenSilently } = useAuth0();
  const client = useQueryClient();
  return useMutation({
    // @ts-ignore
    mutationFn: (values: ICreateDeliveryAllocationRequest) =>
      updateAllocation(getAccessTokenSilently)(channelId, values),
    onSuccess: async (values: any) => {
      onSuccess(values);
      await setTimeout(() => {
        client.invalidateQueries([DELIVERIES_KEY]);
      }, 500);
    },
  });
};

const createDelivery =
  (cb: () => Promise<string>) =>
  async (channelId: string, request: ICreateDeliveryRequest) => {
    const token = await cb();
    const result = await axios.post<ICreateDeliveryRequest, IDelivery>(
      `/api/ledger/v1/channels/${channelId}/deliveries`,
      { ...request, Commodity: 'NG' },
      {
        headers: { authorization: `Bearer ${token}` },
      },
    );
    return result;
  };

export const useCreateDelivery = (onSuccess: (values: any) => void) => {
  const { getAccessTokenSilently } = useAuth0();
  const client = useQueryClient();
  return useMutation({
    // @ts-ignore
    mutationFn: (values: ICreateDeliveryRequest & { ChannelId: string }) =>
      createDelivery(getAccessTokenSilently)(values.ChannelId, values),
    onSuccess: async (values: any) => {
      onSuccess(values);
      await setTimeout(() => {
        client.invalidateQueries([DELIVERIES_KEY]);
      }, 500);
    },
  });
};

const setScheduledQuantity =
  (cb: () => Promise<string>) =>
  async (channelId: string, request: IDelivery) => {
    const token = await cb();
    const result = await axios.post<ICreateDeliveryRequest, IDelivery>(
      `/api/ledger/v1/channels/${channelId}/deliveries/${request.DeliveryId}/schedule`,
      request,
      {
        headers: { authorization: `Bearer ${token}` },
      },
    );
    return result;
  };

export const useUpdateDeliverySchedule = (onSuccess: (values: any) => void) => {
  const { getAccessTokenSilently } = useAuth0();
  const client = useQueryClient();
  return useMutation({
    // @ts-ignore
    mutationFn: (values: IDelivery & { ChannelId: string }) =>
      setScheduledQuantity(getAccessTokenSilently)(values.ChannelId, values),
    onSuccess: async (values: any) => {
      onSuccess(values);
      await setTimeout(() => {
        client.invalidateQueries([DELIVERIES_KEY]);
      }, 500);
    },
  });
};
