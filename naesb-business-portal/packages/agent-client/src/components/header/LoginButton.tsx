import React from 'react';
import { Button } from '@mui/joy';
import { useAuth0 } from '@auth0/auth0-react';
import { useProfile } from 'query/profile';

export const LoginButton = () => {
  const { loginWithRedirect } = useAuth0();
  const { data } = useProfile();
  if (!data) return <></>;
  return (
    <Button
      variant="solid"
      onClick={() =>
        loginWithRedirect({
          authorizationParams: { organization: data.businessId },
        })
      }
      size="sm"
    >
      Login
    </Button>
  );
};
