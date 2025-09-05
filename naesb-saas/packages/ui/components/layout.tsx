import { ReactNode } from 'react';
// import React from 'react';
import { Box, CssBaseline, CssVarsProvider } from '@mui/joy';
import { theme } from './theme';
import { Header } from './header/header';

const Layout = ({ children }: { children: ReactNode }) => (
  <CssVarsProvider theme={theme} defaultMode="dark">
    <CssBaseline />
    <Box display="flex" flexDirection="column">
      <Header />
      <Box>
        <>{children}</>
      </Box>
    </Box>
  </CssVarsProvider>
);

export default Layout;
