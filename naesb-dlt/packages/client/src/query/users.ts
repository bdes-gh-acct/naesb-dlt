import { useAuth0 } from '@auth0/auth0-react';
import { useQueryClient } from 'react-query';
import { IUser } from '@naesb/dlt-model';
import { useAuthorizedMutation } from './useAuthorizedMutation';
import { useAuthorizedQuery } from './useAuthorizedQuery';

const USERS_KEY = 'USERS';

export const useUsersOfOrg = (options: any) => {
  const { user } = useAuth0();
  return useAuthorizedQuery<Array<IUser>>(
    [USERS_KEY, user?.org_id, 'members'],
    `/api/core/v1/identity/organizations/${user?.org_id}/members`,
    options,
  );
};

export const useUser = (userId: string) => {
  return useAuthorizedQuery<IUser>(
    [USERS_KEY, userId],
    `/api/core/v1/identity/users/${userId}`,
  );
};

export const useUpdateUser = (userId: string) => {
  const queryClient = useQueryClient();
  return useAuthorizedMutation<any, IUser>(
    `/api/core/v1/identity/users/${userId}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([USERS_KEY, userId]);
      },
    },
    'patch',
  );
};

export const useDeleteUser = (userId: string, successFn: () => void) => {
  const queryClient = useQueryClient();
  return useAuthorizedMutation<IUser, IUser>(
    `api/core/v1/identity/users/${userId}`,
    {
      onSuccess: () => {
        queryClient.invalidateQueries([USERS_KEY]);
        successFn();
      },
    },
    'delete',
  );
};
