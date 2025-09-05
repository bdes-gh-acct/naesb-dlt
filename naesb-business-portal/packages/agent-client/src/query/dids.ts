import { LedgerDid } from '@naesb/aries-types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const DIDS_KEY = 'DIDS';

const getDids = async () => {
  const result = await axios.get<{
    totalRecords: number;
    data: Array<LedgerDid>;
  }>('/api/agent/v1/ledger/dids');
  return result.data;
};

const getPublicDid = async () => {
  const result = await axios.get<{
    result: { did: string; verkey: string };
  }>('/api/agent/v1/wallet/did/public');
  return result.data;
};

export const useDids = () => {
  return useQuery({ queryFn: getDids, queryKey: [DIDS_KEY] });
};

export const useMyPublicDid = () => {
  return useQuery({
    queryFn: getPublicDid,
    queryKey: ['MyPublicDid'],
    cacheTime: Infinity,
  });
};
