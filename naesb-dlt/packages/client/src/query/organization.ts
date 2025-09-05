import { useAuth0 } from '@auth0/auth0-react';
import { IOrganization } from '@naesb/dlt-model';
import { useQueryClient } from 'react-query';
import { useAuthorizedQuery } from './useAuthorizedQuery';
import { useAuthorizedMutation } from './useAuthorizedMutation';

export const ORGANIZATION_KEY = 'ORGANIZATIONS';
export const baseUrl = '/api/core/v1/identity/organizations';

export const useOrganization = () => {
  const { user } = useAuth0();
  return useAuthorizedQuery<IOrganization>(
    [ORGANIZATION_KEY, user?.org_id],
    `${baseUrl}/${user?.org_id}`,
  );
};

export const useOrganizations = () =>
  useAuthorizedQuery<Array<IOrganization>>(
    [ORGANIZATION_KEY, 'all'],
    `${baseUrl}`,
  );

export const useUpdateOrganization = (id: string) => {
  const queryClient = useQueryClient();
  return useAuthorizedMutation<any, IOrganization>(
    `${baseUrl}/branding/${id}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([ORGANIZATION_KEY, id]);
      },
    },
    'patch',
  );
};
