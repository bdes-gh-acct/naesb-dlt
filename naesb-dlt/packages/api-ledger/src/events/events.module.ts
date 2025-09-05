import { Module } from '@nestjs/common';
import { WebModule } from '@shared/server-utils';
import { LedgerModule } from '../ledger/ledger.module';
import { DbModule } from '../db/db.module';
import { EventsController } from './events.handler';
import { InvoiceEventsController } from './invoiceEvent.handler';
import { TradeModule } from '../trade/trade.module';
import { TradeEventController } from './tradeEvent.controller';
import { CheckpointService } from './checkpoint.service';
import { PeerModule } from '../peer/peer.module';
import { ChaincodeCheckpointService } from './chaincodeCheckpoint.service';
import { GatewayListenerService } from './gatewayListener.service';
import { BaseContractEventController } from './baseContractEvent.controller';
import { BrokerModule } from '../broker/broker.module';
import { DeliveryEventsController } from './deliveryEvent.controller';

@Module({
  imports: [
    DbModule,
    LedgerModule,
    WebModule,
    TradeModule,
    PeerModule,
    BrokerModule,
  ],
  controllers: [
    BaseContractEventController,
    EventsController,
    TradeEventController,
    DeliveryEventsController,
    InvoiceEventsController,
  ],
  providers: [
    CheckpointService,
    ChaincodeCheckpointService,
    GatewayListenerService,
  ],
})
export class EventsModule {}
