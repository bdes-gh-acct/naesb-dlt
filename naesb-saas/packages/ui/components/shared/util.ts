/* eslint-disable no-nested-ternary */
import { addMinutes, format, parse, parseISO, subMinutes } from 'date-fns';

export const toUtc = (value: string | Date | number): Date => {
  const date =
    typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value;
  return addMinutes(date, date.getTimezoneOffset());
};
export const fromUtc = (value: string | Date | number): Date => {
  const date =
    typeof value === 'string' || typeof value === 'number'
      ? new Date(value)
      : value;
  return subMinutes(date, date.getTimezoneOffset());
};

export const formatDate = (
  date?: string | number | Date,
  form = 'MMM dd, yyyy h:mm aa',
  useUTC?: boolean,
): string => {
  if (!date) return '';
  try {
    const value =
      typeof date === 'string'
        ? /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(date)
          ? parseISO(date)
          : parse(date, 'MM/dd/yyyy', new Date())
        : typeof date === 'number'
        ? new Date(date)
        : date;
    return format(useUTC ? toUtc(value) : value, form);
  } catch (e) {
    console.error(`Invalid date ${e}`);
    return '';
  }
};
