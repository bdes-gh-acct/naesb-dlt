import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ITradeViewModel,
  ICreateTradeRequest,
  IAcceptTradeRequest,
  IVoidTradeRequest,
  IReviseTradeRequest,
} from '@naesb/dlt-model';
import { LedgerService } from '../ledger/ledger.service';
import { env } from '../env';

const { NAESB_CONTRACT_LABEL } = env;

@Injectable()
export class TradeService {
  constructor(private readonly ledgerService: LedgerService) {}

  async getTrade(tradeId: string, channel: string, userId: string) {
    return this.ledgerService.evaluateTransaction<ITradeViewModel>({
      channel,
      userId,
      role: userId === 'admin' ? 'admin' : 'client',
      args: [tradeId],
      contract: 'TradeContract',
      namespace: NAESB_CONTRACT_LABEL,
      transactionName: 'getTrade',
    });
  }

  async getHistory<TData extends { TxId: string }>(
    channel: string,
    item: TData,
    userId = 'admin',
  ) {
    return {
      ...item,
      blockInfo: await this.ledgerService.queryBlockByTransactionId({
        channel,
        userId,
        role: userId === 'admin' ? 'admin' : 'client',
        transactionId: item.TxId,
      }),
    };
  }

  async getTradeHistory(tradeId: string, channel: string, userId: string) {
    const history = await this.ledgerService.evaluateTransaction<Array<any>>({
      channel,
      userId,
      role: userId === 'admin' ? 'admin' : 'client',
      args: [tradeId],
      contract: 'TradeContract',
      namespace: NAESB_CONTRACT_LABEL,
      transactionName: 'getTradeHistory',
    });
    return Promise.all(history.map((item) => this.getHistory(channel, item)));
  }

  async listTrades(channel: string, userId: string) {
    return this.ledgerService.evaluateTransaction({
      channel,
      userId,
      role: userId === 'admin' ? 'admin' : 'client',
      args: [JSON.stringify({})],
      contract: 'TradeContract',
      namespace: NAESB_CONTRACT_LABEL,
      transactionName: 'listTrades',
    });
  }

  async createTrade(
    request: ICreateTradeRequest,
    channel: string,
    userId: string,
  ) {
    try {
      const result = await this.ledgerService.submitTransaction({
        channel,
        userId,
        role: userId === 'admin' ? 'admin' : 'client',
        args: [JSON.stringify(request)],
        contract: 'TradeContract',
        namespace: NAESB_CONTRACT_LABEL,
        transactionName: 'initiateTrade',
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async acceptTrade(
    request: IAcceptTradeRequest,
    channel: string,
    userId: string,
  ) {
    try {
      await this.ledgerService.submitTransaction({
        channel,
        userId,
        role: userId === 'admin' ? 'admin' : 'client',
        args: [JSON.stringify(request)],
        contract: 'TradeContract',
        namespace: NAESB_CONTRACT_LABEL,
        transactionName: 'acceptTrade',
      });
      const trade = await this.getTrade(request.DealId, channel, userId);
      return trade;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async queryTrades(
    request: { Ids: Array<string> },
    channel: string,
    userId = 'admin',
  ) {
    try {
      const { data, fetchedRecords, bookmark } =
        await this.ledgerService.evaluateTransaction<{
          data: any;
          fetchedRecords: number;
          bookmark?: string;
        }>({
          channel,
          userId,
          role: userId === 'admin' ? 'admin' : 'client',
          args: [JSON.stringify(request)],
          contract: 'TradeContract',
          namespace: NAESB_CONTRACT_LABEL,
          transactionName: 'queryTradesById',
        });
      return {
        data,
        fetchedRecords,
        bookmark: bookmark === 'nil' ? undefined : bookmark,
      };
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async reviseTrade(
    request: IReviseTradeRequest,
    channel: string,
    userId: string,
  ) {
    try {
      await this.ledgerService.submitTransaction({
        channel,
        userId,
        role: userId === 'admin' ? 'admin' : 'client',
        args: [JSON.stringify(request)],
        contract: 'TradeContract',
        namespace: NAESB_CONTRACT_LABEL,
        transactionName: 'reviseTrade',
      });
      const trade = await this.getTrade(request.DealId, channel, userId);
      return trade;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async voidTrade(request: IVoidTradeRequest, channel: string, userId: string) {
    try {
      await this.ledgerService.submitTransaction({
        channel,
        userId,
        role: userId === 'admin' ? 'admin' : 'client',
        args: [request.DealId],
        contract: 'TradeContract',
        namespace: NAESB_CONTRACT_LABEL,
        transactionName: 'reviseTrade',
      });
      const trade = await this.getTrade(request.DealId, channel, userId);
      return trade;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
