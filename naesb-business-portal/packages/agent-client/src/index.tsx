import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssVarsProvider } from '@mui/joy/styles';
import { CssBaseline } from '@mui/joy';
import { theme } from 'theme';
import { QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import {
  experimental_extendTheme as materialExtendTheme,
  Experimental_CssVarsProvider as MaterialCssVarsProvider,
  THEME_ID as MATERIAL_THEME_ID,
} from '@mui/material/styles';
import { BaseSnackbar } from 'components/shared/snackbar/BaseSnackbar';
import { queryClient } from './query';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const materialTheme = materialExtendTheme();

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement,
);

root.render(
  <React.StrictMode>
    <SnackbarProvider
      Components={{
        error: BaseSnackbar,
        success: BaseSnackbar,
        info: BaseSnackbar,
      }}
    >
      <QueryClientProvider client={queryClient}>
        <MaterialCssVarsProvider
          theme={{ [MATERIAL_THEME_ID]: materialTheme }}
          defaultMode="dark"
        >
          <CssVarsProvider theme={theme} defaultMode="dark">
            <CssBaseline />
            <App />
          </CssVarsProvider>
        </MaterialCssVarsProvider>
      </QueryClientProvider>
    </SnackbarProvider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
