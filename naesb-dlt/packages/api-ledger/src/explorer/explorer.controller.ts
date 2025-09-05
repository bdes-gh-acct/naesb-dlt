import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { Commodity, QueryFactoryParams } from '@naesb/dlt-model';
import { queryFactory } from '@shared/server-utils';
import { Block } from 'src/db/block.entity';
import { Channel } from 'src/db/channel.entity';
import { ChannelMember } from 'src/db/channelMember.entity';
import { InvoiceDetail } from 'src/db/invoiceDetail.entity';
import { Invoice } from 'src/db/invoice.entity';
import { TradeService } from './trade.service';
import { Transaction } from '../db/transaction.entity';
import { BlockService } from './block.service';
import { TransactionService } from './transaction.service';
import { Trade } from '../db/trade.entity';
import { DeliveryService } from './delivery.service';
import { Delivery } from '../db/delivery.entity';
import { DeliveryAllocationService } from './deliveryAllocation.service';
import { DeliveryAllocation } from '../db/deliveryAllocation.entity';
import { ChannelService } from './channel.service';
import { ChannelMemberService } from './channelMember.service';
import { InvoiceDetailService } from './invoiceDetail.service';
import { InvoiceService } from './invoice.service';
import { BaseContractService } from './baseContract.service';
import { BaseContract } from '../db/baseContract.entity';
import { ChannelFacility } from 'src/db/facility.entity';
import { FacilityService } from './facility.service';

@Controller('explorer')
export class ExplorerController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly blockService: BlockService,
    private readonly tradeService: TradeService,
    private readonly deliveryService: DeliveryService,
    private readonly deliveryAllocationService: DeliveryAllocationService,
    private readonly channelService: ChannelService,
    private readonly channelMemberService: ChannelMemberService,
    private readonly invoiceDetailService: InvoiceDetailService,
    private readonly invoiceService: InvoiceService,
    private readonly baseContractService: BaseContractService,
    private readonly facilityService: FacilityService,
  ) {}

  @Post('trades/search')
  getTrades(@Body() body: QueryFactoryParams<Trade>) {
    return this.tradeService.findMany(
      queryFactory(body, { Allocations: true }),
    );
  }

  @Get('trades/:id')
  getTrade(@Param('id') id: string) {
    return this.tradeService.findOne(id, { relations: { Allocations: true } });
  }

  @Post('channels/search')
  getChannels(@Body() body: QueryFactoryParams<Channel>) {
    return this.channelService.findMany(
      queryFactory<Channel>(body, { Members: true }),
    );
  }

  @Get('channels/:id')
  getChannel(@Param('id') id: string) {
    return this.channelService.findOne(id, { relations: { Members: true } });
  }

  @Post('channelmembers/search')
  getChannelMembers(@Body() body: QueryFactoryParams<ChannelMember>) {
    return this.channelMemberService.findMany(
      queryFactory<ChannelMember>(body, { Channel: true }),
    );
  }

  @Post('deliveries/search')
  getDeliveries(@Body() body: QueryFactoryParams<Delivery>) {
    return this.deliveryService.findMany({
      ...queryFactory(body),
      relations: { Allocations: true },
    });
  }

  @Get('deliveries/:id')
  getDelivery(@Param('id') id: string) {
    return this.deliveryService.findOne(id, {
      relations: { Allocations: true },
    });
  }

  @Post('transactions/search')
  getTransactions(@Body() body: QueryFactoryParams<Transaction>) {
    return this.transactionService.findMany(
      queryFactory<Transaction>(body, { block: true }),
    );
  }

  @Get('transactions/:id')
  getTransaction(@Param('id') id: string) {
    return this.transactionService.findOne(id);
  }

  @Post('blocks/search')
  getBlocks(@Body() body: QueryFactoryParams<Block>) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return this.blockService.findMany(queryFactory(body));
  }

  @Get('blocks/:id')
  getBlock(@Param('id') id: string) {
    return this.blockService.findOne(id);
  }

  @Post('allocations/search')
  getAllocations(@Body() body: QueryFactoryParams<DeliveryAllocation>) {
    return this.deliveryAllocationService.findMany(
      queryFactory(body, { Delivery: true }),
    );
  }

  @Get('allocations/:id')
  getAllocation(@Param('id') id: string) {
    return this.deliveryAllocationService.findOne(id);
  }

  @Post('invoicedetails/search')
  getInvoiceDetails(@Body() body: QueryFactoryParams<InvoiceDetail>) {
    return this.invoiceDetailService.findMany(
      queryFactory(body, { Allocation: { Delivery: true } }),
    );
  }

  // @Get('invoicedetails/:id')
  // getInvoiceDetail(@Param('id') id: string) {
  //   return this.invoiceDetailService.findOne(id);
  // }

  @Post('invoices/search')
  getInvoices(@Body() body: QueryFactoryParams<Invoice>) {
    return this.invoiceService.findMany(queryFactory(body, { Details: true }));
  }

  @Get('invoices/:id')
  getInvoice(@Param('id') id: string) {
    return this.invoiceService.findOne(id, {
      relations: { Details: { Trade: true } },
    });
  }

  @Post('BaseContracts/Search')
  getBaseContracts(@Body() body: QueryFactoryParams<BaseContract>) {
    // @ts-ignore
    return this.baseContractService.findMany(queryFactory(body));
  }

  @Get('BaseContracts/:id')
  getBaseContract(@Param('id') id: string) {
    const parts = id.split('_');
    return this.baseContractService.findOne(parts[0], parts[1] as Commodity);
  }

  @Post('Facilities/Search')
  getFacilities(@Body() body: QueryFactoryParams<ChannelFacility>) {
    // @ts-ignore
    return this.facilityService.findMany(queryFactory(body));
  }

  @Get('Facilities/:id')
  getFacility(@Param('id') id: string) {
    const parts = id.split('_');
    return this.facilityService.findOne(parts[0], parts[1]);
  }
}
