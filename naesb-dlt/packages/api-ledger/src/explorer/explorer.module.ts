import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { DbModule } from '../db/db.module';
import { DeliveryService } from './delivery.service';
import { ExplorerController } from './explorer.controller';
import { TradeService } from './trade.service';
import { TransactionService } from './transaction.service';
import { DeliveryAllocationService } from './deliveryAllocation.service';
import { ChannelMemberService } from './channelMember.service';
import { ChannelService } from './channel.service';
import { InvoiceDetailService } from './invoiceDetail.service';
import { InvoiceService } from './invoice.service';
import { BaseContractService } from './baseContract.service';
import { FacilityService } from './facility.service';

@Module({
  imports: [DbModule],
  providers: [
    BlockService,
    TransactionService,
    TradeService,
    DeliveryService,
    DeliveryAllocationService,
    ChannelMemberService,
    ChannelService,
    InvoiceDetailService,
    InvoiceService,
    BaseContractService,
    FacilityService,
  ],
  controllers: [ExplorerController],
})
export class ExplorerModule {}
