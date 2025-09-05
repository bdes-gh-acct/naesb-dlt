import { addMinutes, subMinutes } from 'date-fns';

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
