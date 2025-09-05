import { ValueFormatterFunc } from 'ag-grid-community';

export * from './performanceType';
export * from './priceType';
export * from './status';
export * from './date';

export const numberFormatter: ValueFormatterFunc = ({ value, data }) =>
  data ? value || 0 : undefined;
