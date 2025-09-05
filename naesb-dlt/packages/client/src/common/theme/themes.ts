import {
  ThemeOptions,
  createTheme,
  responsiveFontSizes,
  Components,
} from '@mui/material';
import { TypographyOptions } from '@mui/material/styles/createTypography';

const HEADER_SPACING = '0.00em';

export const typography: TypographyOptions = {
  fontFamily: 'Inter',
  body1: {
    fontFamily: 'Inter',
    fontSize: '14px',
    lineHeight: '17px',
  },
  body2: {
    fontFamily: 'Inter',
    fontSize: '16px',
    lineHeight: '19px',
  },
  h6: {
    fontFamily: 'Goldman, sans-serif',
    letterSpacing: HEADER_SPACING,
    textTransform: 'uppercase',
  },
  h5: {
    fontFamily: 'Goldman, sans-serif',
    letterSpacing: HEADER_SPACING,
    textTransform: 'uppercase',
  },
  h4: {
    fontFamily: 'Goldman, sans-serif',
    letterSpacing: HEADER_SPACING,
    textTransform: 'uppercase',
  },
  h3: {
    fontFamily: 'Goldman, sans-serif',
    letterSpacing: HEADER_SPACING,
    textTransform: 'uppercase',
  },
  h2: {
    fontFamily: 'Goldman, sans-serif',
    letterSpacing: HEADER_SPACING,
    textTransform: 'uppercase',
  },
  h1: {
    fontFamily: 'Goldman, sans-serif',
    letterSpacing: HEADER_SPACING,
    textTransform: 'uppercase',
  },
};

const components: Components = {
  MuiButton: {
    styleOverrides: {
      root: {
        textTransform: 'uppercase',
        fontFamily: 'Goldman, Roboto, sans-serif',
        lineHeight: '23px',
        fontSize: '16px',
        letterSpacing: '0.05em',
        fontWeight: 400,
      },
    },
  },
  MuiPaper: {
    styleOverrides: { root: { backgroundImage: 'unset' } },
  },
};

const PRIMARY = '#009ABD';
const SECONDARY = '#1bc5bd';

export const lightSettings: ThemeOptions = {
  components,
  palette: {
    primary: {
      main: PRIMARY,
    },
    secondary: {
      main: SECONDARY,
    },
    mode: 'light',
  },
  typography,
};

export const darkSettings: ThemeOptions = {
  components,
  palette: {
    background: {
      default: '#1C2023',
      paper: '#303940',
      // default: '#22282D',
      // paper: '#2F373E',
    },
    primary: {
      main: PRIMARY,
    },
    secondary: {
      main: SECONDARY,
    },
    mode: 'dark',
  },
  typography,
};

export const lightTheme = responsiveFontSizes(createTheme(lightSettings));
export const darkTheme = responsiveFontSizes(createTheme(darkSettings));
