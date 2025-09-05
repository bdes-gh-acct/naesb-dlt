import { Button } from '@mui/joy';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from '@tanstack/router';
import { useCallback } from 'react';

/**
 * Renders a button which, when selected, will redirect the page to the logout prompt
 */
export const SignOutButton = () => {
  const { logout } = useAuth0();
  const navigate = useNavigate();

  const logoutCb = useCallback(() => {
    localStorage.removeItem('auth_org_id');
    logout();
    navigate({
      to: '/',
    });
  }, [logout, navigate]);

  return (
    <Button variant="plain" onClick={() => logoutCb()}>
      Sign out using Redirect
    </Button>
  );
};
