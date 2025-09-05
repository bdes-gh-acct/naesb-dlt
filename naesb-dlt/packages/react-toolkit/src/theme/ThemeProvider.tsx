import React from 'react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material';
import { darkTheme, lightTheme } from './themes';

export type ThemeProviderProps = {
  mode?: 'light' | 'dark';
};

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  mode = 'dark',
}) => (
  <MuiThemeProvider theme={mode === 'dark' ? darkTheme : lightTheme}>
    {children}
  </MuiThemeProvider>
);
