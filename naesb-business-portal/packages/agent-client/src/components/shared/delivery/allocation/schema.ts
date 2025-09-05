import { z } from 'zod';

export const allocationSchema = z.object({
  DeliveryId: z.string(),
  Allocations: z.array(
    z.object({
      Quantity: z.coerce.number(),
      DealId: z.string(),
    }),
  ),
});

export const deliveryScheduleSchema = z.object({
  ChannelId: z.string(),
  DeliveryId: z.string(),
  ScheduledQuantity: z.number().optional(),
  ActualQuantity: z.number().optional(),
});
