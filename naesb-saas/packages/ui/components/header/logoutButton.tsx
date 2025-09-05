// import * as React from 'react';
import { IconButton } from '@mui/joy';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

export const LogoutButton = () => (
  <IconButton
    variant="outlined"
    component="a"
    href="/api/auth/logout"
    size="sm"
  >
    <LogoutRoundedIcon />
  </IconButton>
);
