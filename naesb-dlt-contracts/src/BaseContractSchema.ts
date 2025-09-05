import { z } from 'zod';
import { Context } from 'fabric-contract-api';
import { BASE_CONTRACT, Base } from './BaseContract';
import {
  Commodity,
  ContractPaymentDateType,
  ContractPerformanceObligationType,
  ContractTaxPaymentDueBy,
  SpotPricePublication,
} from './model';

const naturalGasCommodityDetailSchema = z
  .object({
    CertifiedGas: z.boolean(),
    AutoAllocation: z.boolean(),
    AutoAllocationPrioritizeDaily: z.boolean().optional(),
    ConfirmDeadlineDays: z.number().default(2),
    PerformanceObligationType: z.nativeEnum(ContractPerformanceObligationType),
    SpotPricePublication: z.nativeEnum(SpotPricePublication),
    OtherSpotPricePublication: z.string().optional(),
    TaxesDueBy: z.nativeEnum(ContractTaxPaymentDueBy),
    PaymentDateType: z.nativeEnum(ContractPaymentDateType),
    PaymentDate: z.number().max(28),
    PaymentType: z.string(),
    Netting: z.boolean(),
    EarlyTerminationDamages: z.boolean(),
    Confidentiality: z.boolean(),
  })
  .refine(
    (values) =>
      values.SpotPricePublication !== SpotPricePublication.OTHER ||
      Boolean(values.SpotPricePublication),
    {
      message: `OtherSpotPricePublication is required when SpotPricePublication is 'Other'`,
      path: ['OtherSpotPricePublication'],
    },
  );

const baseContractSchema = (isEdit: boolean, ctx: Context, existing?: Base) =>
  z.object({
    ReceivingParty: z.string(),
    Commodity: z.nativeEnum(Commodity).refine(
      async (value) => {
        const buffer = await ctx.stub.getState(
          ctx.stub.createCompositeKey(BASE_CONTRACT, [value]),
        );
        return isEdit
          ? buffer && buffer.length > 0
          : !(buffer && buffer.length > 0);
      },
      isEdit
        ? 'Base contract for commodity does not exist'
        : 'Base contract for commodity already exists',
    ),
    CommodityDetail: naturalGasCommodityDetailSchema,
    TextHash: z.string(),
    Reviewing: z
      .string()
      .optional()
      .refine(() => {
        if (!isEdit) return true;
        return existing?.Reviewing !== ctx.clientIdentity.getMSPID();
      }, 'Only reviewing party can update contract'),
  });

export const createBaseContractSchema = (ctx: Context) => {
  return baseContractSchema(false, ctx);
};

export const reviseBaseContractSchema = (ctx: Context, existing?: Base) => {
  return baseContractSchema(true, ctx, existing);
};
