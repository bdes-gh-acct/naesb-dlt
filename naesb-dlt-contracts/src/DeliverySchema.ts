import { z } from 'zod';
import { Commodity, DELIVERY } from './model';
import { Context } from 'fabric-contract-api';

export const baseDeliverySchema = (ctx: Context) =>
  z.object({
    DeliveryId: z.string().refine(async (value) => {
      const key = ctx.stub.createCompositeKey(DELIVERY, [value]);
      const buffer = await ctx.stub.getState(key);
      return !(buffer && buffer.length > 0);
    }, 'DeliveryId already exists'),
    Date: z.string().datetime(),
    TspDeliveryId: z.string().optional(),
    NominatedQuantity: z.number().positive(),
    DeliveryLocation: z.string(),
    ReceivingParty: z.string(),
    TspBusinessId: z.string(),
    Commodity: z.nativeEnum(Commodity),
  });
