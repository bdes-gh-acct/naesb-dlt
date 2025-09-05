import { z } from 'zod';

export const createDeliverySchema = z.object({
  ChannelId: z.string(),
  TspDeliveryId: z.string().optional(),
  ReceivingParty: z.string(),
  Date: z.string().datetime(),
  DeliveryLocation: z.string(),
  NominatedQuantity: z.coerce.number(),
});
