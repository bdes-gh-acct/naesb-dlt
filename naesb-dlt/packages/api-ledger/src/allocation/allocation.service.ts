import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ILedgerQueryResult,
  IDeliveryAllocation,
  ICreateDeliveryAllocationRequest,
  IUpdateDeliveryAllocationRequest,
} from '@naesb/dlt-model';
import { IRawQueryResult } from '../util/types';
import { LedgerService } from '../ledger/ledger.service';
import { env } from '../env';

const { NAESB_CONTRACT_LABEL } = env;

@Injectable()
export class AllocationService {
  constructor(private readonly ledgerService: LedgerService) {}

  async getAllocation(allocationId: string, channel: string, userId = 'admin') {
    await this.ledgerService.evaluateTransaction({
      channel,
      userId,
      role: userId === 'admin' ? 'admin' : 'client',
      args: allocationId.split('_'),
      contract: 'DeliveryContract',
      namespace: NAESB_CONTRACT_LABEL,
      transactionName: 'getAllocation',
    });
  }

  async listAllocations(
    channel: string,
    userId = 'admin',
  ): Promise<ILedgerQueryResult<IDeliveryAllocation>> {
    const result =
      await this.ledgerService.evaluateTransaction<IRawQueryResult>({
        channel,
        userId,
        role: 'client',
        args: [JSON.stringify({})],
        contract: 'DeliveryContract',
        namespace: NAESB_CONTRACT_LABEL,
        transactionName: 'listAllocations',
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

  async createAllocation(
    channel,
    request: ICreateDeliveryAllocationRequest,
    userId,
  ) {
    try {
      const result = await this.ledgerService.submitTransaction({
        channel,
        userId,
        role: 'client',
        args: [JSON.stringify({ ...request })],
        contract: 'DeliveryContract',
        namespace: NAESB_CONTRACT_LABEL,
        transactionName: 'createAllocation',
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async updateAllocation(
    channel: string,
    request: IUpdateDeliveryAllocationRequest,
    userId: string,
  ) {
    try {
      const result = await this.ledgerService.submitTransaction({
        channel,
        userId,
        role: 'client',
        args: [JSON.stringify({ ...request })],
        contract: 'DeliveryContract',
        namespace: NAESB_CONTRACT_LABEL,
        transactionName: 'updateAllocation',
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
