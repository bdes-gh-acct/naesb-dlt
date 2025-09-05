import { format, addMinutes, subMinutes } from 'date-fns';
import { Theme, useTheme } from '@mui/joy';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Breakpoint } from '@mui/material';

export const toUtc = (value?: string | Date | number): Date | undefined => {
  if (!value) return undefined;
  const date =
    typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value;
  const newDateTime = addMinutes(date, date.getTimezoneOffset());
  return newDateTime;
};

export const fromUtc = (value?: string | Date | number): Date | undefined => {
  if (!value) return undefined;
  const date =
    typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value;
  const newDateTime = subMinutes(date, date.getTimezoneOffset());
  return newDateTime;
};

export const formatDate = (
  date?: string | number,
  form = 'MMM d, yyyy h:mm a',
  useUTC?: boolean,
) => {
  if (!date) return '';
  try {
    const value =
      typeof date === 'string'
        ? new Date(date)
        : typeof date === 'number'
        ? new Date(date)
        : date;
    // @ts-ignore
    return format(useUTC ? toUtc(value) : (value as string | number), form);
  } catch (e) {
    console.error(`Invalid date ${e}`);
    return '';
  }
};

type BreakpointOrNull = Breakpoint | null;

/**
 * Be careful using this hook. It only works because the number of
 * breakpoints in theme is static. It will break once you change the number of
 * breakpoints. See https://reactjs.org/docs/hooks-rules.html#only-call-hooks-at-the-top-level
 */
export const useWidth = () => {
  const theme: Theme = useTheme();
  const keys = theme.breakpoints.keys.map((key) => key).reverse();
  return (
    keys.reduce((output: BreakpointOrNull, key: Breakpoint) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const matches = useMediaQuery(theme.breakpoints.up(key));
      return !output && matches ? key : output;
    }, null) || 'xs'
  );
};
