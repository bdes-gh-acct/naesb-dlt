import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Logout from '@mui/icons-material/Logout';
import { useCallback, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useOrganization } from '@query/organization';
import {
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Popover,
} from '@mui/material';
import { useHistory } from 'react-router-dom';

export const AccountMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, logout } = useAuth0();
  const { data: organization } = useOrganization();
  const open = Boolean(anchorEl);
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const history = useHistory();
  const logoutCb = useCallback(() => {
    localStorage.removeItem('auth_org_id');
    logout();
    history.push('/');
  }, [logout, history]);
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Tooltip title="Account settings">
        <IconButton onClick={handleClick} size="small">
          <Avatar src={user?.picture}>
            {user?.given_name?.[0] || ''}
            {user?.family_name?.[0] || ''}
          </Avatar>
        </IconButton>
      </Tooltip>
      <Popover
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 10,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            padding: 1,
            mt: 1.5,
            '& .MuiAvatar-root': {},
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 18,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              backgroundImage:
                'linear-gradient(rgba(255, 255, 255, 0.13), rgba(255, 255, 255, 0.13))',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <List>
          <ListItem>
            <ListItemAvatar>
              <Avatar src={user?.picture} sx={{ marginRight: 0 }} />
            </ListItemAvatar>
            <ListItemText
              primary={user?.email}
              secondary={organization?.display_name}
            />
          </ListItem>
        </List>
        <Divider sx={{ mb: 1 }} />
        {/* <MenuItem>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem> */}
        <MenuItem onClick={logoutCb}>
          <ListItemIcon>
            <Logout fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Popover>
    </>
  );
};
