import { extendTheme } from '@mui/joy';

declare module '@mui/joy/styles' {
  interface Palette {
    brand: {
      primary: string;
      secondary: string;
    };
  }
}

export const theme = extendTheme({
  components: {
    JoyButton: {
      styleOverrides: {
        root: {
          textTransform: 'uppercase',
          fontFamily: 'Goldman, Roboto, sans-serif',
          letterSpacing: '0.05em',
          fontWeight: 400,
        },
      },
    },
    JoyFormHelperText: {
      styleOverrides: {
        root: {
          minHeight: 17.5,
          marginTop: 3,
          marginBottom: 4,
          paddingLeft: 2,
        },
      },
    },
    JoyAutocomplete: {
      styleOverrides: {
        listbox: {
          zIndex: 10000,
        },
      },
    },
  },
  fontFamily: { body: 'Inter' },
  typography: {
    h1: {
      fontFamily: 'Goldman, Roboto, sans-serif',
      textTransform: 'uppercase',
    },
    h2: {
      fontFamily: 'Goldman, Roboto, sans-serif',
      textTransform: 'uppercase',
    },
    h3: {
      fontFamily: 'Goldman, Roboto, sans-serif',
      textTransform: 'uppercase',
    },
    h4: {
      fontFamily: 'Goldman, Roboto, sans-serif',
      textTransform: 'uppercase',
    },
  },
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          200: '#00caf8',
          300: '#00bae4',
          400: '#00aad1',
          500: '#009ABD',
          600: '#006a82',
          700: '#005a6f',
          800: '#003a47',
          900: '#001a20',
          plainColor: '#009ABD',
          solidBg: '#009ABD',
          solidHoverBg: '#006a82',
          solidActiveBg: '#009ABD',
        },
      },
    },
  },
});
