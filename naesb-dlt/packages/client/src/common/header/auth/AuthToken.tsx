import { MenuItem } from '@mui/material';
import { copyToClipboard } from '@react/toolkit';
import { useAuth0 } from '@auth0/auth0-react';

export const AuthToken = () => {
  const { getAccessTokenSilently } = useAuth0();

  const getAccessToken = async () => {
    try {
      const token = await getAccessTokenSilently();
      copyToClipboard(token);
    } catch (e) {
      console.log(e);
    }
  };

  return <MenuItem onClick={getAccessToken}>Copy Auth Token</MenuItem>;
};
