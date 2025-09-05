/* eslint-disable default-case */
import { PerformanceTypeCode, PerformanceTypes } from '@naesb/dlt-model';
import { ValueFormatterParams } from 'ag-grid-community';

export const formatPerformanceType = (value?: string) => {
  const status = PerformanceTypes.find((code) => code.Code === value);
  return status ? status.DisplayName : undefined;
};

export const performanceTypeFormatter = ({ value }: ValueFormatterParams) =>
  formatPerformanceType(value) || '';

export const performanceFormatter = ({ value, data }: ValueFormatterParams) => {
  switch (value) {
    case PerformanceTypeCode.FIRM_FIXED:
      return data.FFQty;
    case PerformanceTypeCode.FIRM_VARIABLE:
      return `${data.FVMinQty}-${data.FVMaxQty}`;
    case PerformanceTypeCode.INTERRUPTIBLE:
      return `Up to ${data.ITMaxQty}`;
  }
  return '';
};
