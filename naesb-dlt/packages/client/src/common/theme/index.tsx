import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { darkTheme, lightTheme } from './themes';

export type ThemeProps = {
  mode?: 'light' | 'dark';
};

export const ThemeProvider: React.FC<ThemeProps> = ({
  children,
  mode = 'dark',
}) => (
  <MuiThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
    {children}
  </MuiThemeProvider>
);
