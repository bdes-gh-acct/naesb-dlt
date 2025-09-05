/* eslint-disable @typescript-eslint/no-inferrable-types */
import {
  Context,
  Contract,
  Info,
  Returns,
  Transaction,
} from 'fabric-contract-api';
import { QueryResult } from './Delivery';
import { Trade } from './Trade';
import {
  ChangeTypeStatusCode,
  PerformanceTypeCode,
  PriceTypeCode,
} from './model';
import { getKeyHistory, processResultset, validate } from './util';
import {
  acceptTradeSchema,
  buyerTradeSchema,
  createTradeSchema,
  editTradeSchema,
  sellerTradeSchema,
} from './TradeSchema';
import { KeyHistory } from './History';
import { BASE_CONTRACT, Base } from './BaseContract';

@Info({ title: 'TradeContract', description: 'NAESB Trade Contract' })
export class TradeContract extends Contract {
  constructor() {
    super('TradeContract');
  }

  private nonAdminCommands = [
    'init',
    'TradeContract:acceptTrade',
    'TradeContract:exists',
    'TradeContract:getTrade',
    'TradeContract:getTradeHistory',
    'TradeContract:getTradeStatus',
    'TradeContract:initiateTrade',
    'TradeContract:listTrades',
    'TradeContract:queryTradesById',
    'TradeContract:reviseTrade',
    'TradeContract:updateTradePartyHeader',
    'TradeContract:voidTrade',
  ];

  private adminCommands = [
    'init',
    'TradeContract:exists',
    'TradeContract:getTrade',
    'TradeContract:getTradeStatus',
    'TradeContract:listTrades',
    'TradeContract:getTradeHistory',
    'TradeContract:queryTradesById',
  ];

  private getAuthorization(tx: string, ctx: Context) {
    const mspId = ctx.clientIdentity.getMSPID();
    if (mspId !== 'D000000000' && !this.nonAdminCommands.includes(tx)) {
      throw new Error(
        `The participant belonging to MSP: ${mspId} cannot invoke transaction: ${tx}`,
      );
    } else if (mspId === 'D000000000' && !this.adminCommands.includes(tx)) {
      throw new Error(
        `The participant belonging to MSP: ${mspId} cannot invoke transaction: ${tx}`,
      );
    }
  }

  public async beforeTransaction(ctx: Context) {
    const tx = ctx.stub.getFunctionAndParameters().fcn;
    this.getAuthorization(tx, ctx);
  }

  /**
   * Perform any setup of the ledger that might be required
   * @param {Context} ctx the transaction context
   */
  @Transaction()
  public async init(ctx: Context) {
    console.log('Upgrading the trade contract');
  }

  /**
   * Validate if the tradeId already exists on the ledger
   * @param {Context} ctx the transaction context
   * @param {string} tradeId the unique trade identifier
   */
  @Transaction(false)
  @Returns('boolean')
  public async exists(ctx: Context, tradeId: string): Promise<boolean> {
    const buffer = await ctx.stub.getState(tradeId);
    return !!buffer && buffer.length > 0;
  }

  @Transaction()
  @Returns('Trade')
  public async initiateTrade(ctx: Context, input: string): Promise<Trade> {
    const currentMSPID = ctx.clientIdentity.getMSPID();
    const inputJSON = JSON.parse(input) as any;
    const buffer = await ctx.stub.getState(
      ctx.stub.createCompositeKey(BASE_CONTRACT, [inputJSON.Commodity]),
    );
    const baseContract =
      buffer && buffer.length
        ? (JSON.parse(buffer.toString()) as Base)
        : undefined;
    const schema = createTradeSchema(
      currentMSPID === inputJSON.BuyerParty,
      ctx,
      inputJSON,
      baseContract,
    );

    const validatedResult = await validate(schema, {
      ...inputJSON,
      BaseContractRevision: baseContract?.Revision,
    });
    const {
      FFQty,
      BaseContractRevision,
      FVMaxQty,
      FVMinQty,
      DealId,
      Commodity,
      DeliveryLocation,
      DeliveryPeriodEnd,
      DeliveryPeriodStart,
      Price,
      PriceIndex,
      PriceIndexDifferential,
      BuyerTrader,
      SellerTrader,
      BuyerParty,
      BuyerDealId,
      SellerDealId,
      SellerParty,
      ITMaxQty,
      PerformanceType,
      PriceType,
      Certified,
      Facilities,
    } = validatedResult;
    const exists = await this.exists(ctx, DealId);
    if (exists) {
      throw new Error(`The trade ${DealId} already exists`);
    }
    if (BuyerParty !== currentMSPID && SellerParty !== currentMSPID) {
      throw new Error(
        `The BuyerParty or SellerParty must match the current identity`,
      );
    }
    const trade = new Trade();
    trade.DealId = DealId;
    trade.Commodity = Commodity;
    trade.BuyerParty = BuyerParty;
    trade.BaseContractRevision = BaseContractRevision;
    if (currentMSPID === BuyerParty) {
      trade.BuyerTrader = BuyerTrader || trade.BuyerTrader;
      trade.BuyerDealId = BuyerDealId || trade.BuyerDealId;
    } else if (currentMSPID === SellerParty) {
      trade.SellerTrader = SellerTrader || trade.SellerTrader;
      trade.SellerDealId = SellerDealId || trade.SellerDealId;
    }
    trade.SellerParty = SellerParty;
    trade.DeliveryPeriodStart = DeliveryPeriodStart;
    trade.DeliveryPeriodEnd = DeliveryPeriodEnd;
    trade.DeliveryLocation = DeliveryLocation;
    trade.Certified = Certified;
    trade.Facilities = JSON.stringify(Facilities);
    trade.Status = ChangeTypeStatusCode.INITIATE;
    trade.InitiatingParty =
      BuyerParty === currentMSPID ? BuyerParty : SellerParty;
    trade.Reviewing = currentMSPID === BuyerParty ? SellerParty : BuyerParty;
    trade.PriceType = PriceType;
    if (PriceType === PriceTypeCode.FIXED) {
      trade.Price = Price;
    } else if (PriceType === PriceTypeCode.INDEX) {
      trade.PriceIndex = PriceIndex;
      trade.PriceIndexDifferential = PriceIndexDifferential;
    }
    trade.PerformanceType = PerformanceType;
    if (PerformanceType === PerformanceTypeCode.FIRM_FIXED) {
      trade.FFQty = FFQty;
    } else if (PerformanceType === PerformanceTypeCode.FIRM_VARIABLE) {
      trade.FVMaxQty = FVMaxQty;
      trade.FVMinQty = FVMinQty;
    } else {
      trade.ITMaxQty = ITMaxQty;
    }
    trade.CreatedBy = ctx.clientIdentity.getID();
    trade.UpdatedBy = ctx.clientIdentity.getID();
    await this.saveTrade(trade, ctx);
    return trade;
  }

  @Transaction(false)
  @Returns('Trade[]')
  public async listTrades(ctx: Context, request: string): Promise<Trade[]> {
    const { pageSize = 100, bookmark } = JSON.parse(request);
    const resultSet = await ctx.stub.getStateByRangeWithPagination(
      '',
      '',
      pageSize,
      bookmark,
    );
    return await processResultset(resultSet.iterator);
  }

  @Transaction(false)
  @Returns('QueryResult')
  public async queryTradesById(
    ctx: Context,
    request: string,
  ): Promise<QueryResult> {
    const { Ids, pageSize = 100, bookmark } = JSON.parse(request);
    const selector: any = {
      DealId: {
        $in: Ids,
      },
    };
    const query = {
      selector,
      use_index: ['_design/DealIdIndexDoc', 'DealIdIndex'],
    };
    const resultSet = await ctx.stub.getQueryResultWithPagination(
      JSON.stringify(query),
      pageSize,
      bookmark,
    );
    const data = await processResultset(resultSet.iterator);
    return {
      data: JSON.stringify(data),
      fetchedRecords: resultSet.metadata.fetchedRecordsCount,
      bookmark: resultSet.metadata.bookmark,
    };
  }

  @Transaction()
  public async acceptTrade(ctx: Context, input: string): Promise<void> {
    const tradeJSON = JSON.parse(input) as any;
    const trade = await this.getTrade(ctx, tradeJSON.DealId);
    const currentMSPID = ctx.clientIdentity.getMSPID();
    const { BuyerTrader, BuyerDealId, SellerTrader, SellerDealId, Facilities } =
      await validate(acceptTradeSchema(ctx, tradeJSON, trade), tradeJSON);
    if (currentMSPID === trade.BuyerParty) {
      trade.BuyerTrader = BuyerTrader || trade.BuyerTrader;
      trade.BuyerDealId = BuyerDealId || trade.BuyerDealId;
    } else if (currentMSPID === trade.SellerParty) {
      trade.SellerTrader = SellerTrader || trade.SellerTrader;
      trade.SellerDealId = SellerDealId || trade.SellerDealId;
      trade.Facilities = Facilities
        ? JSON.stringify(Facilities)
        : trade.Facilities;
    }
    trade.Status = ChangeTypeStatusCode.ACCEPT;
    trade.Reviewing = undefined;
    trade.UpdatedBy = ctx.clientIdentity.getID();
    await this.saveTrade(trade, ctx);
  }

  @Transaction()
  public async updateTradePartyHeader(
    ctx: Context,
    input: string,
  ): Promise<void> {
    const { DealId } = JSON.parse(input) as any;
    const trade = await this.getTrade(ctx, DealId);
    const currentMSPID = ctx.clientIdentity.getMSPID();
    if (![trade.BuyerParty, trade.SellerParty].includes(currentMSPID)) {
      throw new Error(`${currentMSPID} is not authorized to update this trade`);
    }
    const { BuyerDealId, SellerDealId, BuyerTrader, SellerTrader } =
      await validate(
        currentMSPID === trade.BuyerDealId
          ? buyerTradeSchema
          : sellerTradeSchema,
        JSON.parse(input),
      );
    if (currentMSPID === trade.BuyerParty) {
      trade.BuyerTrader = BuyerTrader || trade.BuyerTrader;
      trade.BuyerDealId = BuyerDealId || trade.BuyerDealId;
    } else if (currentMSPID === trade.SellerParty) {
      trade.SellerTrader = SellerTrader || trade.SellerTrader;
      trade.SellerDealId = SellerDealId || trade.SellerDealId;
    }
    trade.UpdatedBy = ctx.clientIdentity.getID();
    await this.saveTrade(trade, ctx);
  }

  @Transaction()
  public async voidTrade(ctx: Context, DealId: string): Promise<void> {
    const trade = await this.getTrade(ctx, DealId);
    if (trade.Status !== ChangeTypeStatusCode.DISPUTE) {
      throw new Error(
        'The trade ' +
          DealId +
          ' is in the wrong status.  Expected D got ' +
          trade.Status,
      );
    }
    const currentMSPID = ctx.clientIdentity.getMSPID();
    if (trade.Reviewing !== currentMSPID) {
      throw new Error(
        `The trade can only be voided by the party currently reviewing.  Current reviewer: ${trade.Reviewing}`,
      );
    }

    trade.Status = ChangeTypeStatusCode.VOID;
    trade.Reviewing = undefined;
    trade.UpdatedBy = ctx.clientIdentity.getID();
    await this.saveTrade(trade, ctx);
  }

  @Transaction()
  public async reviseTrade(ctx: Context, input: string): Promise<void> {
    const inputJSON = JSON.parse(input) as any;
    const trade = await this.getTrade(ctx, (inputJSON as Trade).DealId);
    const currentMSPID = ctx.clientIdentity.getMSPID();
    const buffer = await ctx.stub.getState(
      ctx.stub.createCompositeKey(BASE_CONTRACT, [inputJSON.Commodity]),
    );
    const baseContract =
      buffer && buffer.length
        ? (JSON.parse(buffer.toString()) as Base)
        : undefined;
    const schema = editTradeSchema(
      currentMSPID === inputJSON.BuyerParty,
      ctx,
      inputJSON,
      trade,
      baseContract,
    );
    const validatedResult = await validate(schema, inputJSON);
    const {
      FFQty,
      FVMaxQty,
      FVMinQty,
      DeliveryLocation,
      DeliveryPeriodEnd,
      DeliveryPeriodStart,
      Price,
      PriceIndex,
      PriceIndexDifferential,
      BuyerTrader,
      SellerTrader,
      BuyerParty,
      BuyerDealId,
      SellerDealId,
      SellerParty,
      ITMaxQty,
      PerformanceType,
      PriceType,
    } = validatedResult;
    const isInitiatingParty = currentMSPID === trade.InitiatingParty;

    trade.Status = isInitiatingParty
      ? ChangeTypeStatusCode.REVISE
      : ChangeTypeStatusCode.DISPUTE;
    trade.Reviewing =
      trade.Reviewing === trade.BuyerParty
        ? trade.SellerParty
        : trade.BuyerParty;

    trade.BuyerParty = BuyerParty;
    if (currentMSPID === BuyerParty) {
      trade.BuyerTrader = BuyerTrader || trade.BuyerTrader;
      trade.BuyerDealId = BuyerDealId || trade.BuyerDealId;
    } else if (currentMSPID === SellerParty) {
      trade.SellerTrader = SellerTrader || trade.SellerTrader;
      trade.SellerDealId = SellerDealId || trade.SellerDealId;
    }
    trade.SellerParty = SellerParty;
    trade.DeliveryPeriodStart = DeliveryPeriodStart;
    trade.DeliveryPeriodEnd = DeliveryPeriodEnd;
    trade.DeliveryLocation = DeliveryLocation;
    trade.PriceType = PriceType;
    trade.PriceIndex = undefined;
    trade.PriceIndexDifferential = undefined;
    trade.Price = undefined;
    if (PriceType === PriceTypeCode.FIXED) {
      trade.Price = Price;
    } else if (PriceType === PriceTypeCode.INDEX) {
      trade.PriceIndex = PriceIndex;
      trade.PriceIndexDifferential = PriceIndexDifferential;
    }
    trade.PerformanceType = PerformanceType;
    trade.FVMaxQty = undefined;
    trade.FVMinQty = undefined;
    trade.ITMaxQty = undefined;
    trade.FFQty = undefined;
    if (PerformanceType === PerformanceTypeCode.FIRM_FIXED) {
      trade.FFQty = FFQty;
    } else if (PerformanceType === PerformanceTypeCode.FIRM_VARIABLE) {
      trade.FVMaxQty = FVMaxQty;
      trade.FVMinQty = FVMinQty;
    } else {
      trade.ITMaxQty = ITMaxQty;
    }
    trade.UpdatedBy = ctx.clientIdentity.getID();
    await this.saveTrade(trade, ctx);
  }

  @Transaction(false)
  @Returns('Trade')
  public async getTrade(ctx: Context, DealId: string): Promise<Trade> {
    const buffer = await ctx.stub.getState(DealId);
    if (!!buffer && buffer.length > 0) {
      const trade = JSON.parse(buffer.toString()) as Trade;
      return trade;
    }
    throw new Error(`The trade ${DealId} does not exists`);
  }

  private async saveTrade(trade: Trade, ctx: Context) {
    trade.Revision = (trade.Revision || 0) + 1;
    const buffer = Buffer.from(JSON.stringify(trade));
    await ctx.stub.putState(trade.DealId, buffer);
    await ctx.stub.setEvent('TradeEvent', buffer);
  }

  @Transaction(false)
  @Returns('KeyHistory[]')
  public async getTradeHistory(
    ctx: Context,
    DealId: string,
  ): Promise<KeyHistory<Trade>[]> {
    return getKeyHistory(ctx, DealId);
  }
}
