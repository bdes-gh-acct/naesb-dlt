import { IOrganization } from '@shared/model';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { useRouter } from 'next/router';

export const ORGANIZATION_KEY = 'ORGANIZATION';

export const getOrganizations = async () => {
  const result = await axios.post('/api/organizations/search');
  return result.data;
};

export const createOrganization = async (
  data: IOrganization,
): Promise<IOrganization> => {
  const result = await axios.post<IOrganization, AxiosResponse<IOrganization>>(
    '/api/organizations',
    data,
  );
  return result.data;
};

export const useCreateOrganization = () => {
  const router = useRouter();

  return useMutation({
    mutationFn: createOrganization,
    onSuccess: () => {
      router.push('/organizations');
    },
  });
};

export const useOrganizations = () =>
  useQuery({
    queryKey: [ORGANIZATION_KEY],
    queryFn: getOrganizations,
  });

export const getUserOrganization = async () => {
  const result = await axios.get('/api/userOrganizations/user');
  return result.data.data;
};

export const useUserOrganization = () =>
  useQuery({
    queryKey: [ORGANIZATION_KEY, 'user'],
    queryFn: getUserOrganization,
  });
