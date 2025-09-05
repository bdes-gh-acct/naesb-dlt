import { ITradeViewModel, ITrade, PerformanceTypeCode } from '@naesb/dlt-model';
import { addDays, differenceInDays } from 'date-fns';
import { env } from '../env';

const { ORG_MSP_ID } = env;

export const transformTrade = (
  trade: ITrade & { ChannelId: string },
): ITradeViewModel => {
  const Duration = differenceInDays(
    addDays(new Date(trade.DeliveryPeriodEnd), 1),
    new Date(trade.DeliveryPeriodStart),
  );
  const max =
    trade.PerformanceType === PerformanceTypeCode.FIRM_FIXED
      ? trade.FFQty
      : trade.PerformanceType === PerformanceTypeCode.FIRM_VARIABLE
      ? trade.FVMaxQty
      : trade.ITMaxQty;
  const min =
    trade.PerformanceType === PerformanceTypeCode.FIRM_FIXED
      ? trade.FFQty
      : trade.PerformanceType === PerformanceTypeCode.INTERRUPTIBLE
      ? undefined
      : trade.FVMinQty;
  const tradeWithNulls = Object.entries(trade).reduce(
    (acc: Partial<ITradeViewModel>, [key, value]) => ({
      ...acc,
      [key]: value === undefined ? null : value,
    }),
    { Reviewing: null },
  );
  return {
    ...tradeWithNulls,
    Duration,
    OrgDealId:
      trade.BuyerParty === ORG_MSP_ID ? trade.BuyerDealId : trade.SellerDealId,
    CounterpartyDealId:
      trade.BuyerParty === ORG_MSP_ID ? trade.SellerDealId : trade.BuyerDealId,
    MaxTotalQuantity: Duration ? Duration * (max || 0) : undefined,
    MinTotalQuantity: Duration ? Duration * (min || 0) : undefined,
    MaxDailyQuantity: max,
    MinDailyQuantity: min,
    CounterpartyId:
      ORG_MSP_ID === trade.BuyerParty ? trade.SellerParty : trade.BuyerParty,
    Type: ORG_MSP_ID === trade.BuyerParty ? 'Buy' : 'Sell',
  } as ITradeViewModel;
};
