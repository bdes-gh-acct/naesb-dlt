import { ISchema } from '@naesb/aries-types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const SCHEMAS_KEY = 'SCHEMAS';

const getSchemas = async () => {
  const result = await axios.get<{
    data: Array<ISchema>;
    totalRecords: number;
  }>('/api/agent/v1/ledger/schemas');
  return result.data;
};

export const useSchemas = () => {
  return useQuery({
    queryFn: getSchemas,
    queryKey: [SCHEMAS_KEY],
  });
};
