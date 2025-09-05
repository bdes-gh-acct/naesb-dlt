import { BadRequestException, Injectable } from '@nestjs/common';
import {
  ILedgerQueryResult,
  IInvoiceDetail,
  ICreateInvoiceDetailRequest,
  ICreateInvoiceRequest,
} from '@naesb/dlt-model';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { DeliveryAllocation } from '../db/deliveryAllocation.entity';
import { LedgerService } from '../ledger/ledger.service';
import { IRawQueryResult } from '../util/types';
import { PriceService } from '../price/price.service';
import { env } from '../env';

const { NAESB_CONTRACT_LABEL } = env;

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(DeliveryAllocation)
    private deliveryAllocationRepository: Repository<DeliveryAllocation>,
    private readonly ledgerService: LedgerService,
    private readonly priceService: PriceService,
  ) {}

  async getInvoiceDetail(
    invoiceId: string,
    allocationId: string,
    channel: string,
    userId: string,
  ) {
    return this.ledgerService.evaluateTransaction<IInvoiceDetail>({
      channel,
      userId,
      role: 'client',
      args: [invoiceId, allocationId],
      contract: 'InvoiceContract',
      namespace: NAESB_CONTRACT_LABEL,
      transactionName: 'getInvoiceDetail',
    });
  }

  async listInvoiceDetails(
    channel: string,
    userId: string,
  ): Promise<ILedgerQueryResult<IInvoiceDetail>> {
    const result =
      await this.ledgerService.evaluateTransaction<IRawQueryResult>({
        channel,
        userId,
        role: 'client',
        args: [JSON.stringify({})],
        contract: 'InvoiceContract',
        namespace: NAESB_CONTRACT_LABEL,
        transactionName: 'listInvoiceDetails',
      });
    return {
      ...result,
      data: JSON.parse(result.data),
    };
  }

  async createInvoiceDetail(
    request: ICreateInvoiceDetailRequest,
    channel: string,
    userId: string,
  ) {
    try {
      const result = await this.ledgerService.submitTransaction({
        channel,
        userId,
        role: 'client',
        args: [JSON.stringify(request)],
        contract: 'InvoiceContract',
        namespace: NAESB_CONTRACT_LABEL,
        transactionName: 'createInvoiceDetail',
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }

  async createInvoice(
    request: ICreateInvoiceRequest,
    channel: string,
    userId: string,
  ) {
    const allocations = await this.deliveryAllocationRepository.find({
      where: {
        Delivery: {
          Date: Between(request.InvoicePeriodStart, request.InvoicePeriodEnd),
        },
        ChannelId: channel,
      },
      relations: ['Delivery', 'Trade'],
    });
    const dates = [
      ...new Set(
        allocations
          .filter((allocation) => allocation.Trade?.PriceIndex)
          .map((allocation) => allocation.Delivery?.Date),
      ),
    ];
    const indexes = [
      ...new Set(
        allocations
          .filter((allocation) => allocation.Trade?.PriceIndex)
          .map((allocation) => allocation.Trade?.PriceIndex),
      ),
    ];
    const prices = indexes.length
      ? // @ts-ignore
        await this.priceService.getPrices(indexes, dates)
      : [];
    const Details = allocations.map((allocation) => {
      let Price = allocation.Trade?.Price;
      if (!Price && allocation.Trade?.PriceIndex) {
        const indexPrice = prices.find(
          (price) =>
            price.Date === allocation.Delivery?.Date &&
            price.IndexId === allocation.Trade?.PriceIndex,
        );
        if (indexPrice) {
          Price =
            (indexPrice.Price as number) +
            (allocation.Trade?.PriceIndexDifferential || 0);
        }
      }
      return {
        InvoiceId: request.InvoiceId,
        DealId: allocation.DealId,
        Quantity: allocation.Quantity,
        Price,
        AllocationId: allocation.AllocationId,
        Date: allocation.Delivery?.Date,
      };
    });
    try {
      const result = await this.ledgerService.submitTransaction({
        channel,
        userId,
        role: 'client',
        args: [JSON.stringify({ ...request, Details })],
        contract: 'InvoiceContract',
        namespace: NAESB_CONTRACT_LABEL,
        transactionName: 'createInvoice',
      });
      return result;
    } catch (e) {
      throw new BadRequestException(e);
    }
  }
}
