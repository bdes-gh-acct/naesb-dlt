import { ChangeTypeStatuses } from '@naesb/dlt-model';
import { ValueFormatterParams } from 'ag-grid-community';

export const formatStatus = (value?: string) => {
  const status = ChangeTypeStatuses.find((code) => code.Code === value);
  return status ? status.DisplayName : undefined;
};

export const statusFormatter = ({ value }: ValueFormatterParams) =>
  formatStatus(value) || '';
