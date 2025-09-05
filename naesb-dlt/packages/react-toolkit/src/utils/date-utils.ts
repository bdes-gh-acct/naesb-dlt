/* eslint-disable no-nested-ternary */
import { addMinutes, format, parseISO } from 'date-fns';

export const toUtc = (value: string | Date | number): Date => {
  const date =
    typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value;
  return addMinutes(date, -date.getTimezoneOffset());
};

export const fromUtc = (value: string | Date | number): Date => {
  const date =
    typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value;
  return addMinutes(date, date.getTimezoneOffset());
};

export const formatDate = (
  date?: string | number | Date,
  form = 'MMM dd, yyyy',
  useUTC?: boolean,
): string => {
  if (!date) return '';
  const value =
    typeof date === 'string'
      ? parseISO(date)
      : typeof date === 'number'
      ? new Date(date)
      : date;
  return format(useUTC ? fromUtc(value) : value, form);
};
