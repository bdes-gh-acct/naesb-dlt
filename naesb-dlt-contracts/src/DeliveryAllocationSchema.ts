import { Context } from 'fabric-contract-api';
import { z } from 'zod';
import { DELIVERY, PerformanceTypeCode } from './model';
import { Delivery } from './Delivery';
import { Trade } from './Trade';

export const allocationSchema = (ctx: Context) =>
  z
    .object({
      DeliveryId: z
        .string()
        .optional()
        .refine(async (value) => {
          if (!value) return true;
          const delivery: Delivery = JSON.parse(
            (
              await ctx.stub.getState(
                ctx.stub.createCompositeKey(DELIVERY, [value]),
              )
            ).toString(),
          );
          return (
            ctx.clientIdentity.getMSPID() === delivery.ServiceRequestorParty
          );
        }, 'Delivery allocations can only be created by Service Requestor'),
      Quantity: z.number(),
      DealId: z.string(),
    })
    .superRefine(async (value, zod) => {
      const existing = await ctx.stub.getState(value.DealId);
      const trade = JSON.parse(existing.toString()) as Trade;
      if (!existing || !existing.length) {
        zod.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['DealId'],
          message: `DealId does not exist`,
        });
      }
      const mspId = ctx.clientIdentity.getMSPID();
      if (trade.SellerParty === mspId && value.Quantity < 0) {
        zod.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['Quantity'],
          message: `Quantity must be positive for Seller`,
        });
      }
      if (trade.BuyerParty === mspId && value.Quantity > 0) {
        zod.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['Quantity'],
          message: `Quantity must be negative for Buyer`,
        });
      }
      const MaxQuantity =
        trade.PerformanceType === PerformanceTypeCode.FIRM_FIXED
          ? trade.FFQty
          : trade.PerformanceType === PerformanceTypeCode.FIRM_VARIABLE
          ? trade.FVMaxQty
          : trade.ITMaxQty;
      if (trade.BuyerParty === mspId && value.Quantity > (MaxQuantity || 0)) {
        zod.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['Quantity'],
          message: `Quantity cannot exceed trade amount for buyback`,
        });
      }
    });

export const saveAllocationsSchema = (ctx: Context, DeliveryId: string) =>
  z.object({
    DeliveryId: z.string().refine(async (value) => {
      const delivery: Delivery = JSON.parse(
        (
          await ctx.stub.getState(
            ctx.stub.createCompositeKey(DELIVERY, [value]),
          )
        ).toString(),
      );
      return ctx.clientIdentity.getMSPID() === delivery.ServiceRequestorParty;
    }, 'Delivery allocations can only be created by Service Requestor'),
    Allocations: z.array(allocationSchema(ctx)).refine(
      async (values) => {
        const delivery: Delivery = JSON.parse(
          (
            await ctx.stub.getState(
              ctx.stub.createCompositeKey(DELIVERY, [DeliveryId]),
            )
          ).toString(),
        );
        const total = values.reduce(
          (acc: number, val) => (acc + val.Quantity) as number,
          0,
        );
        return total <= (delivery.ActualQuantity || 0);
      },
      {
        message:
          'Total allocated quantity cannot exceed actual quantity for delivery',
        path: ['Allocations'],
      },
    ),
  });
