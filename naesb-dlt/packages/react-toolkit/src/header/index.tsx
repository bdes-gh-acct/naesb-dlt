import { useEffect, ReactNode } from 'react';
import { Toolbar, Box, AppBar, useTheme } from '@mui/material';
import { useAuth0 } from '@auth0/auth0-react';
import { ThemeProvider } from '../theme';
import { Logo } from './nav/Logo';

import LoginButton from './auth/Login';

export interface HeaderProps {
  nav?: ReactNode;
  actions?: ReactNode;
}

export const Header: React.FC<HeaderProps> = ({ nav, actions }) => {
  const { user, isAuthenticated, isLoading } = useAuth0();
  const theme = useTheme();
  useEffect(() => {
    if (user) {
      localStorage.setItem('auth_org_id', user?.org_id);
    }
  }, [user]);

  return (
    <ThemeProvider mode="dark">
      <AppBar
        position="fixed"
        color={isAuthenticated ? 'inherit' : 'transparent'}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          boxShadow: 'none',
        }}
      >
        <Toolbar
          style={{
            position: 'relative',
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            width="100%"
            alignItems="center"
          >
            <Logo />
            {nav && nav}
            <Box display="flex" alignItems="center">
              {actions && actions}
              {Boolean(!isLoading && !isAuthenticated) && <LoginButton />}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>
    </ThemeProvider>
  );
};
