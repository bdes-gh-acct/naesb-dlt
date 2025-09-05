import { IQueryResult } from '@naesb/dlt-model';
import { sortBy } from 'lodash';
import { useMemo } from 'react';
import { useOrganizations } from './organization';
import {
  useAuthorizedQuery,
  useAuthorizedSearchQuery,
} from './useAuthorizedQuery';

export const CHANNELS_KEY = 'CHANNELS';

export const useChannels = () =>
  useAuthorizedSearchQuery<IQueryResult<{ ChannelId: string; Name: string }>>(
    CHANNELS_KEY,
    '/api/ledger/v1/explorer/channels/search',
  );

export const useChannelInfo = (channelId: string) =>
  useAuthorizedQuery<{ channels: Array<{ channel_id: string }> }>(
    [CHANNELS_KEY, channelId],
    `/api/ledger/v1/channels/${channelId}`,
  );

export const useChannelMsps = (channelId: string) =>
  useAuthorizedQuery<Array<any>>(
    [CHANNELS_KEY, channelId, 'msps'],
    `/api/ledger/v1/channels/${channelId}/msps`,
  );

export const useChannelContractsInfo = (channelId: string) =>
  useAuthorizedQuery<{ chaincodes: Array<{ name: string; version: string }> }>(
    [CHANNELS_KEY, channelId, 'contracts'],
    `/api/ledger/v1/channels/${channelId}/contracts`,
  );

export const useChannelOrganizations = (channelId: string) => {
  const { data: organizations, isLoading: organizationsLoading } =
    useOrganizations();

  const { data: msps, isLoading: mspsLoading } = useChannelMsps(channelId);

  const data = useMemo(() => {
    if (!organizations || !msps) return undefined;

    return msps?.reduce((acc: Array<any>, msp: string) => {
      const org = organizations.find(
        (organization) => organization.metadata.msp_id === msp,
      );

      const result = org ? [...acc, { msp_id: msp, org }] : acc;

      return sortBy(result, ['msp_id']);
    }, []);
  }, [msps, organizations]);

  return { data, isLoading: organizationsLoading || mspsLoading };
};
