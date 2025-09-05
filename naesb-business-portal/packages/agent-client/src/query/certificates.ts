import { IWell } from '@naesb/aries-types';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

export const CERTIFICATES_KEY = 'CERTIFICATES';

const getCertificates = async () => {
  const result = await axios.post<{ data: Array<IWell>; totalRecords: number }>(
    '/api/agent/v1/certificates/search',
  );
  return result.data;
};

export const useCertificates = () => {
  return useQuery({
    queryFn: getCertificates,
    queryKey: [CERTIFICATES_KEY],
  });
};
