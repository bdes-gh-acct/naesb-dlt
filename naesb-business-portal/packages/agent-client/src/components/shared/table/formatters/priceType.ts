/* eslint-disable @typescript-eslint/no-unsafe-return */
import { PriceTypeCode, PriceTypes } from '@naesb/dlt-model';
import { ValueFormatterParams } from 'ag-grid-community';

export const formatPriceType = (value?: string) => {
  const status = PriceTypes.find((code) => code.Code === value);
  return status ? status.DisplayName : undefined;
};

export const priceTypeFormatter = ({ value }: ValueFormatterParams) =>
  formatPriceType(value) || '';

export const priceFormatter = ({ value, data }: ValueFormatterParams): string =>
  value === PriceTypeCode.FIXED
    ? data.Price?.toString()
    : `${data.PriceIndex} ${
        data.PriceIndexDifferential && data.PriceIndexDifferential > 0
          ? `+${data.PriceIndexDifferential}`
          : data.PriceIndexDifferential || ''
      }`;
