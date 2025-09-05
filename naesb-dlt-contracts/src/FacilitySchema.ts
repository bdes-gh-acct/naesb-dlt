import { z } from 'zod';
import { Context } from 'fabric-contract-api';
import { Base } from './BaseContract';
import { FACILITY } from './Facility';

const facilitySchema = (ctx: Context, isEdit?: boolean) =>
  z.object({
    FacilityId: z.string().refine(
      async (value) => {
        const buffer = await ctx.stub.getState(
          ctx.stub.createCompositeKey(FACILITY, [value]),
        );
        return isEdit
          ? buffer && buffer.length > 0
          : !(buffer && buffer.length > 0);
      },
      isEdit
        ? 'Facility does not exist'
        : 'Facility with this ID already exists',
    ),
    Name: z.string(),
    Type: z.string(),
    Owner: z.string().default(ctx.clientIdentity.getMSPID()),
    ReceiptLocationId: z.string().optional(),
  });

export const createFacilitySchema = (ctx: Context) => {
  return facilitySchema(ctx);
};

export const bulkCreateFacilitySchema = (ctx: Context, existing?: Base) => {
  return z.array(facilitySchema(ctx));
};
