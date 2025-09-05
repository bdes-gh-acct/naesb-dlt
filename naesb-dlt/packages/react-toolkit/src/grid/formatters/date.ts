import { formatDate } from 'utils';
import { ValueFormatterParams } from 'ag-grid-community';

export const dateFormatter =
  (format = 'M/d/yyyy h:mm a', utc?: boolean) =>
  ({ value }: ValueFormatterParams) =>
    formatDate(
      value && typeof value === 'string' ? new Date(value) : value,
      format,
      utc,
    );
