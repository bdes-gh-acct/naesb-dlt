import { MenuItem, ListItemIcon } from '@mui/material';
import Logout from '@mui/icons-material/Logout';
import { useAuth0 } from '@auth0/auth0-react';
import { useCallback } from 'react';
import { useHistory } from 'react-router-dom';

export interface ILogoutButton {
  mobile: boolean;
}

export const LogoutButton: React.FC<ILogoutButton> = ({ mobile }) => {
  const { logout } = useAuth0();
  const history = useHistory();

  const logoutCb = useCallback(() => {
    localStorage.removeItem('auth_org_id');
    logout();
    history.push('/');
  }, [logout, history]);

  return (
    <MenuItem
      onClick={logoutCb}
      sx={
        mobile ? { justifyContent: 'center' } : { justifyContent: 'flex-start' }
      }
    >
      <ListItemIcon>
        <Logout fontSize="small" />
      </ListItemIcon>
      Logout
    </MenuItem>
  );
};
