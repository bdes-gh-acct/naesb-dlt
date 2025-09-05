import { z } from 'zod';
import { PerformanceTypeCode, PriceTypeCode } from '@naesb/dlt-model';

const fixedQuantityTradeSchema = z.object({
  FFQty: z.number().positive(),
  PerformanceType: z.literal(PerformanceTypeCode.FIRM_FIXED),
});

const firmVariableTradeSchema = z.object({
  FVMinQty: z.number().positive(),
  FVMaxQty: z.number().positive(),
  PerformanceType: z.literal(PerformanceTypeCode.FIRM_VARIABLE),
});

const interruptibleTradeSchema = z.object({
  ITMaxQty: z.number().positive(),
  PerformanceType: z.literal(PerformanceTypeCode.INTERRUPTIBLE),
});

const baseTradeSchema = z.object({
  ChannelId: z.string(),
  Type: z.string(),
  BuyerParty: z.string(),
  BaseContractNumber: z.number(),
  SellerParty: z.string(),
  DeliveryLocation: z.coerce.string(),
  DeliveryPeriodStart: z.string().datetime(),
  DeliveryPeriodEnd: z.string().datetime(),
  SellerDealId: z.string().optional(),
  SellerTrader: z.string().optional(),
  BuyerDealId: z.string().optional(),
  BuyerTrader: z.string().optional(),
});

const fixedPriceTypeSchema = z.object({
  Price: z.number().positive(),
  PriceType: z.literal(PriceTypeCode.FIXED),
});

const indexPriceTypeSchema = z.object({
  PriceIndex: z.string(),
  PriceIndexDifferential: z.number().default(0),
  PriceType: z.literal(PriceTypeCode.INDEX),
});

const priceSchema = z.discriminatedUnion('PriceType', [
  fixedPriceTypeSchema,
  indexPriceTypeSchema,
]);
const performanceSchema = z.discriminatedUnion('PerformanceType', [
  fixedQuantityTradeSchema,
  firmVariableTradeSchema,
  interruptibleTradeSchema,
]);

export const createTradeSchema = z.intersection(
  baseTradeSchema,
  z.intersection(priceSchema, performanceSchema),
);
