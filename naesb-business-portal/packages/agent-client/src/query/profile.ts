import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export interface IProfile {
  businessId: string;
  name: string;
  mspId: string;
  mspCa: string;
  tlsCa: string;
}

export const ORG_PROFILE = 'ORG_PROFILE';

const getProfile = async () => {
  const result = await axios.get<IProfile>('/api/core/v1/.well-known/nodeinfo');
  return result.data;
};

export const useProfile = () => {
  return useQuery({
    queryFn: getProfile,
    queryKey: [ORG_PROFILE],
    cacheTime: Infinity,
    refetchOnWindowFocus: false,
  });
};
