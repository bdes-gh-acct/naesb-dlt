import { PerformanceTypeCode, PriceTypeCode } from '@naesb/dlt-model';
import { object, string, number } from 'yup';

export const createTradeSchema = object().shape({
  FFQty: number().when('PerformanceType', {
    is: PerformanceTypeCode.FIRM_FIXED,
    then: number().required().positive(),
  }),
  PerformanceType: string()
    .required()
    .oneOf(Object.values(PerformanceTypeCode)),
  FVMaxQty: number().when(
    ['PerformanceType', 'FVMinQty'],
    (performanceType, FVMinQty) =>
      performanceType === PerformanceTypeCode.FIRM_VARIABLE
        ? number().required().min(FVMinQty)
        : number(),
  ),
  FVMinQty: number().when(['PerformanceType'], (performanceType) =>
    performanceType === PerformanceTypeCode.FIRM_VARIABLE
      ? number().required().positive()
      : number(),
  ),
  ITMaxQty: number().when(['PerformanceType'], (performanceType) =>
    performanceType === PerformanceTypeCode.INTERRUPTIBLE
      ? number().required().positive()
      : number(),
  ),
  PriceType: string().required().oneOf(Object.values(PriceTypeCode)),
  Price: number().when('PriceType', (priceType) =>
    priceType === PriceTypeCode.FIXED
      ? number().required().positive()
      : number(),
  ),
  PriceIndex: string().when('PriceType', (priceType) =>
    priceType === PriceTypeCode.INDEX ? string().required() : string(),
  ),
  PriceIndexDifferential: number(),
  DeliveryLocation: string().required(),
  DeliveryPeriodEnd: string().matches(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/,
  ),
  DeliveryPeriodStart: string().matches(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/,
  ),
});
