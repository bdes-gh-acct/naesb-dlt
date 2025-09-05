import { BadRequestException, Injectable } from '@nestjs/common';
import { ILedgerQueryResult, IBaseContract } from '@naesb/dlt-model';
import { IRawQueryResult } from '../util/types';
import { LedgerService } from '../ledger/ledger.service';
import { env } from '../env';

const { NAESB_CONTRACT_LABEL } = env;

@Injectable()
export class BaseContractService {
  constructor(private readonly ledgerService: LedgerService) {}

  async getContract(commodity: string, channelId: string, userId = 'admin') {
    await this.ledgerService.evaluateTransaction({
      channel: channelId,
      userId,
      role: userId === 'admin' ? 'admin' : 'client',
      args: [commodity],
      contract: 'BaseContract',
      namespace: NAESB_CONTRACT_LABEL,
      transactionName: 'getContract',
    });
  }

  async listContracts(
    channel: string,
    userId = 'admin',
  ): Promise<ILedgerQueryResult<IBaseContract>> {
    const result =
      await this.ledgerService.evaluateTransaction<IRawQueryResult>({
        channel,
        userId,
        role: 'client',
        args: [JSON.stringify({})],
        contract: 'BaseContract',
        namespace: NAESB_CONTRACT_LABEL,
        transactionName: 'listContracts',
      });
    return {
      ...result,
      data: JSON.parse(result.data),
    };
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

  async initiateContract(channel, request: IBaseContract, userId) {
    try {
      const result = await this.ledgerService.submitTransaction({
        channel,
        userId,
        role: 'client',
        args: [JSON.stringify({ ...request })],
        contract: 'BaseContract',
        namespace: NAESB_CONTRACT_LABEL,
        transactionName: 'initiateContract',
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async reviseContract(channel, request: IBaseContract, userId) {
    try {
      const result = await this.ledgerService.submitTransaction({
        channel,
        userId,
        role: 'client',
        args: [JSON.stringify({ ...request })],
        contract: 'BaseContract',
        namespace: NAESB_CONTRACT_LABEL,
        transactionName: 'reviseContract',
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async acceptContract(channel: string, commodity: string, userId: string) {
    try {
      const result = await this.ledgerService.submitTransaction({
        channel,
        userId,
        role: 'client',
        args: [JSON.stringify({ Commodity: commodity })],
        contract: 'BaseContract',
        namespace: NAESB_CONTRACT_LABEL,
        transactionName: 'acceptContract',
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
