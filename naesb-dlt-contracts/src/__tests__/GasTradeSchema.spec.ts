import { Context } from 'fabric-contract-api';
import { createTradeSchema } from '../TradeSchema';
import { ICreateTradeRequest, ITrade, PriceTypeCode } from '../model';
import { validate } from '../util';

describe('CreateTradeSchema', () => {
  it('should validate', async () => {
    const ctx = {
      stub: { getState: jest.fn().mockResolvedValue(Buffer.from([0x62])) },
    } as unknown as Context;
    const trade: ITrade & ICreateTradeRequest = {
      DealId: '1',
      BuyerParty: 'A',
      SellerParty: 'B',
      DeliveryLocation: 'Pool 1',
      PriceType: PriceTypeCode.FIXED,
      Price: 3.0,
    } as any;
    const schema = createTradeSchema(true, ctx, trade);
    let err: Error;
    try {
      const result = await validate(schema as any, trade);
      console.log(result);
    } catch (error) {
      err = error;
    }
    expect(JSON.parse((err as any)?.message)).toEqual({
      DeliveryPeriodStart: 'Required',
      DeliveryPeriodEnd: 'Required',
      PerformanceType: 'Required',
    });
  });
});
