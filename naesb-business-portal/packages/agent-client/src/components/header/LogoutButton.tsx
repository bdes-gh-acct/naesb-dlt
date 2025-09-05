import { MenuItem } from '@mui/joy';
import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';
import { useNavigate } from '@tanstack/router';

export interface ILogoutButton {
  mobile: boolean;
}

export const LogoutButton: React.FC<ILogoutButton> = ({ mobile }) => {
  const { logout } = useAuth0();
  const navigate = useNavigate();

  const logoutCb = useCallback(() => {
    localStorage.removeItem('auth_org_id');
    logout();
    navigate({ to: '/' });
  }, [logout, navigate]);

  return (
    <MenuItem
      onClick={logoutCb}
      sx={
        mobile ? { justifyContent: 'center' } : { justifyContent: 'flex-start' }
      }
    >
      Logout
    </MenuItem>
  );
};
