import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ITradeViewModel,
  ICreateDeliveryRequest,
  ILedgerQueryResult,
  ISetScheduledQuantityRequest,
  ISetActualQuantityRequest,
  ITspLocation,
  IDelivery,
  IAllocateDeliveryRequest,
} from '@naesb/dlt-model';
import { IRawQueryResult } from '../util/types';
import { LedgerService } from '../ledger/ledger.service';
import { env } from '../env';
import { RegistryService } from '../registry/registry.service';

const { NAESB_CONTRACT_LABEL } = env;

export interface IQueryLocationsParams {
  location: number;
  date?: string;
  channel: string;
  userId: string;
}

@Injectable()
export class DeliveryService {
  constructor(
    private readonly ledgerService: LedgerService,
    private registryService: RegistryService,
  ) {}

  getDelivery(deliveryId: string, channel: string, userId: string) {
    return this.ledgerService.evaluateTransaction<IDelivery>({
      userId,
      channel,
      args: [deliveryId],
      contract: 'DeliveryContract',
      transactionName: 'getDelivery',
      namespace: NAESB_CONTRACT_LABEL,
    });
  }

  async allocate(
    request: IAllocateDeliveryRequest,
    channel: string,
    userId: string,
  ) {
    try {
      const result = await this.ledgerService.submitTransaction({
        userId,
        channel,
        args: [JSON.stringify(request)],
        contract: 'DeliveryContract',
        transactionName: 'saveAllocations',
        namespace: NAESB_CONTRACT_LABEL,
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async listDeliveriesByLocation({
    location,
    date,
    channel,
    userId,
  }: IQueryLocationsParams): Promise<ILedgerQueryResult<ITradeViewModel>> {
    const result =
      await this.ledgerService.evaluateTransaction<IRawQueryResult>({
        userId,
        channel,
        args: [JSON.stringify({ DeliveryLocation: location, Date: date })],
        contract: 'DeliveryContract',
        transactionName: 'listDeliveriesByLocation',
        namespace: NAESB_CONTRACT_LABEL,
      });
    return {
      ...result,
      data: JSON.parse(result.data),
    };
  }

  async listDeliveries(
    channel: string,
    userId: string,
  ): Promise<ILedgerQueryResult<ITradeViewModel>> {
    const result =
      await this.ledgerService.evaluateTransaction<IRawQueryResult>({
        userId,
        channel,
        args: [JSON.stringify({})],
        contract: 'DeliveryContract',
        transactionName: 'listDeliveries',
        namespace: NAESB_CONTRACT_LABEL,
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

  async getDeliveryHistory(
    deliveryId: string,
    channel: string,
    userId: string,
  ) {
    const result = await this.ledgerService.evaluateTransaction<Array<any>>({
      userId,
      channel,
      args: [deliveryId],
      contract: 'DeliveryContract',
      transactionName: 'getDeliveryHistory',
      namespace: NAESB_CONTRACT_LABEL,
    });
    return Promise.all(result.map((item) => this.getHistory(channel, item)));
  }

  async createDelivery(
    request: ICreateDeliveryRequest & { DeliveryId: string },
    channel: string,
    userId: string,
    token: string,
  ) {
    const { TspBusinessId, DeliveryLocation } = request;
    if (!TspBusinessId) {
      const tspLocation = await this.registryService.get<ITspLocation>(
        `/Locations/${DeliveryLocation}`,
        token,
      );
      request.TspBusinessId = tspLocation.businessId;
    }
    try {
      const result = await this.ledgerService.submitTransaction({
        userId,
        channel,
        args: [JSON.stringify(request)],
        contract: 'DeliveryContract',
        transactionName: 'createDelivery',
        namespace: NAESB_CONTRACT_LABEL,
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async setScheduledQuantity(
    request: ISetScheduledQuantityRequest,
    channel: string,
    userId: string,
  ) {
    try {
      const result = await this.ledgerService.submitTransaction({
        userId,
        channel,
        args: [JSON.stringify(request)],
        contract: 'DeliveryContract',
        transactionName: 'setScheduledQuantity',
        namespace: NAESB_CONTRACT_LABEL,
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async setScheduledQuantities(
    request: ISetScheduledQuantityRequest & ISetActualQuantityRequest,
    channel: string,
    userId: string,
  ) {
    try {
      const result = await this.ledgerService.submitTransaction({
        userId,
        channel,
        args: [JSON.stringify(request)],
        contract: 'DeliveryContract',
        transactionName: 'updateDeliverySchedule',
        namespace: NAESB_CONTRACT_LABEL,
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async setActualQuantity(
    request: ISetActualQuantityRequest,
    channel: string,
    userId: string,
  ) {
    try {
      const result = await this.ledgerService.submitTransaction({
        userId,
        channel,
        args: [JSON.stringify(request)],
        contract: 'DeliveryContract',
        transactionName: 'setActualQuantity',
        namespace: NAESB_CONTRACT_LABEL,
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
