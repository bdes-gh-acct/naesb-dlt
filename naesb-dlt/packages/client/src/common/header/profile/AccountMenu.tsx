import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Popover } from '@mui/material';
import { AccountMenuItems } from './AccountMenuItems';
import { LogoutButton } from '../auth/LogoutButton';
import { AuthToken } from '../auth/AuthToken';

export const AccountMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const { user, getAccessTokenSilently } = useAuth0();
  const open = Boolean(anchorEl);

  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  // TODO: REMOVE THIS. This is only for testing purposes for the CA wallet service
  useEffect(() => {
    const getUserMetadata = async () => {
      const userDetailsByIdUrl = `https://naesb.us.auth0.com/userinfo`;

      try {
        const accessToken = await getAccessTokenSilently();

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const metadataResponse = await fetch(userDetailsByIdUrl, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
      } catch (error: any) {
        console.log(error.message);
      }
    };

    getUserMetadata();
  }, [getAccessTokenSilently, user?.sub]);

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
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <AccountMenuItems />
        <AuthToken />
        <LogoutButton mobile={false} />
      </Popover>
    </>
  );
};
