import { z } from 'zod';
import {
  ChangeTypeStatusCode,
  Commodity,
  ITrade,
  PerformanceTypeCode,
  PriceTypeCode,
} from './model';
import { Context } from 'fabric-contract-api';
import { Base } from './BaseContract';
import { FACILITY } from './Facility';

const RevisableStatusCodes = [
  ChangeTypeStatusCode.DISPUTE,
  ChangeTypeStatusCode.INITIATE,
  ChangeTypeStatusCode.REVISE,
];

const fixedQuantityTradeSchema = z.object({
  FFQty: z.number().positive(),
  PerformanceType: z.literal(PerformanceTypeCode.FIRM_FIXED),
});

const firmVariableTradeSchema = z.object({
  FVMinQty: z.number().positive(),
  FVMaxQty: z.number().positive(),
  PerformanceType: z.literal(PerformanceTypeCode.FIRM_VARIABLE),
});

const fallbackPerformanceTypeSchema = z.object({
  PerformanceType: z.nativeEnum(PerformanceTypeCode),
});

const interruptibleTradeSchema = z.object({
  ITMaxQty: z.number().positive(),
  PerformanceType: z.literal(PerformanceTypeCode.INTERRUPTIBLE),
});

const baseTradeSchema = (
  isBuyer: boolean,
  isEdit: boolean,
  ctx: Context,
  baseContract?: Base,
) =>
  z
    .object({
      DealId: z.string().refine(
        async (value) => {
          const buffer = await ctx.stub.getState(value);
          return isEdit
            ? buffer && buffer.length > 0
            : !(buffer && buffer.length > 0);
        },
        isEdit ? 'DealId does not exist' : 'DealId already exists',
      ),
      BuyerParty: z.string(),
      BaseContractRevision: z
        .number()
        .default(baseContract?.Revision as number),
      SellerParty: z.string(),
      DeliveryLocation: z.string(),
      DeliveryPeriodStart: z.string().datetime(),
      DeliveryPeriodEnd: z.string().datetime(),
      Commodity: z
        .nativeEnum(Commodity)
        .refine(
          () => baseContract && baseContract.Approved,
          'No approved base contract exists for this commodity',
        ),
      Certified: z
        .boolean()
        .default(false)
        .refine(
          (value) =>
            !value || baseContract?.Approved?.CommodityDetail.CertifiedGas,
          'Certified gas is not enabled under this base contract',
        ),
    })
    .merge(isBuyer ? buyerTradeSchema : sellerTradeSchema);

export const buyerTradeSchema = z.object({
  BuyerDealId: z.string().optional(),
  BuyerTrader: z.string().optional(),
});

export const sellerTradeSchema = z.object({
  SellerDealId: z.string().optional(),
  SellerTrader: z.string().optional(),
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

const certifiedSchema = (existing: boolean, ctx: Context) =>
  z.object({
    Facilities: existing
      ? z
          .string()
          .optional()
          .refine(async (value) => {
            if (value) {
              const ex = await ctx.stub.getState(
                ctx.stub.createCompositeKey(FACILITY, [value]),
              );
              return !!ex && ex.length;
            }
            if (!value && !existing) return false;
            return true;
          }, 'Facility does not exist')
      : z.string().refine(async (value) => {
          if (value) {
            const ex = await ctx.stub.getState(
              ctx.stub.createCompositeKey(FACILITY, [value]),
            );
            return !!ex && ex.length;
          }
          if (!value && !existing) return false;
          return true;
        }, 'Facility does not exist'),
  });

export const createTradeSchema = (
  isBuyer: boolean,
  ctx: Context,
  trade: ITrade,
  baseContract?: Base,
) => {
  const performanceSchema =
    trade.PerformanceType === PerformanceTypeCode.FIRM_FIXED
      ? fixedQuantityTradeSchema
      : trade.PerformanceType === PerformanceTypeCode.FIRM_VARIABLE
      ? firmVariableTradeSchema
      : trade.PerformanceType === PerformanceTypeCode.INTERRUPTIBLE
      ? interruptibleTradeSchema
      : fallbackPerformanceTypeSchema;
  const priceSchema =
    trade.PriceType === PriceTypeCode.FIXED
      ? fixedPriceTypeSchema
      : indexPriceTypeSchema;
  const schema = baseTradeSchema(isBuyer, false, ctx, baseContract)
    .merge(performanceSchema)
    .merge(priceSchema);
  return trade.Certified && !isBuyer
    ? schema.merge(certifiedSchema(false, ctx))
    : schema;
};

export const editTradeSchema = (
  isBuyer: boolean,
  ctx: Context,
  trade: ITrade,
  existing: ITrade,
  baseContract?: Base,
) => {
  const currentMSPID = ctx.clientIdentity.getMSPID();
  const isInitiatingParty = currentMSPID === existing.InitiatingParty;
  const performanceSchema =
    trade.PerformanceType === PerformanceTypeCode.FIRM_FIXED
      ? fixedQuantityTradeSchema
      : trade.PerformanceType === PerformanceTypeCode.FIRM_VARIABLE
      ? firmVariableTradeSchema
      : trade.PerformanceType === PerformanceTypeCode.INTERRUPTIBLE
      ? interruptibleTradeSchema
      : fallbackPerformanceTypeSchema;
  const priceSchema =
    trade.PriceType === PriceTypeCode.FIXED
      ? fixedPriceTypeSchema
      : indexPriceTypeSchema;
  const schema = baseTradeSchema(isBuyer, false, ctx, baseContract)
    .merge(performanceSchema)
    .merge(priceSchema);
  const intermediateSchema =
    trade.Certified && !isBuyer
      ? schema.merge(certifiedSchema(Boolean(existing.Facilities), ctx))
      : schema;
  return (
    intermediateSchema
      // @ts-ignore
      .refine(
        () => {
          return existing.Reviewing === currentMSPID;
        },
        {
          message: `The trade can only be ${
            isInitiatingParty ? 'revised' : 'disputed'
          } by the party currently reviewing.  Current reviewer: ${
            trade.Reviewing
          }`,
          path: ['Reviewing'],
        },
      )
      .refine(
        () => {
          return RevisableStatusCodes.includes(existing.Status);
        },
        {
          message: ` is not in a revisable status.  Expected ${RevisableStatusCodes.join(
            ', ',
          )}`,
          path: ['Status'],
        },
      )
  );
};

const AcceptableStatusCodes = [
  ChangeTypeStatusCode.INITIATE,
  ChangeTypeStatusCode.DISPUTE,
  ChangeTypeStatusCode.REVISE,
];

export const acceptTradeSchema = (
  ctx: Context,
  trade: ITrade,
  existing: ITrade,
) => {
  const currentMSPID = ctx.clientIdentity.getMSPID();
  let schema =
    currentMSPID === existing.BuyerParty ? buyerTradeSchema : sellerTradeSchema;
  if (existing.Certified) {
    schema = schema.merge(certifiedSchema(Boolean(existing.Facilities), ctx));
  }
  return (
    schema
      // @ts-ignore
      .refine(
        () => {
          return existing.Reviewing === currentMSPID;
        },
        {
          message: `The trade can only be accepted by the party currently reviewing.  Current reviewer: ${trade.Reviewing}`,
          path: ['Reviewing'],
        },
      )
      .refine(
        () => {
          return AcceptableStatusCodes.includes(existing.Status);
        },
        {
          message: ` is not in a status that can be accepted.  Expected ${AcceptableStatusCodes.join(
            ', ',
          )}`,
          path: ['Status'],
        },
      )
  );
};
