import { z } from 'zod';

const naturalGasCommodityDetailSchema = z.object({
  AutoAllocation: z.boolean(),
  AutoAllocationPrioritizeDaily: z.boolean().optional(),
  CertifiedGas: z.boolean(),
  Confidentiality: z.boolean(),
  ConfirmDeadlineDays: z.number().default(2),
  EarlyTerminationDamages: z.boolean(),
  Netting: z.boolean(),
  PaymentDate: z.number().max(28),
  PaymentDateType: z.string(),
  PaymentType: z.string(),
  PerformanceObligationType: z.string(),
  SpotPricePublication: z.string(),
  TaxesDueBy: z.string(),
});

export const baseContractSchema = z.object({
  ReceivingParty: z.string(),
  Accept: z.boolean().refine((val) => val),
  Commodity: z.string(),
  ChannelId: z.string(),
  CommodityDetail: naturalGasCommodityDetailSchema,
  TextHash: z.string().optional().default('testing'),
});
