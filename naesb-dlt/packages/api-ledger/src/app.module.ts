import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { TerminusModule } from '@nestjs/terminus';
import { JwtAuthGuard, JwtStrategy } from '@shared/server-utils';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ChannelModule } from './channel/channel.module';
import { IdentityModule } from './identity/identity.module';
import { LedgerModule } from './ledger/ledger.module';
import { TradeModule } from './trade/trade.module';
import { HealthController } from './health/health.controller';
import { TransactionsModule } from './transactions/transactions.module';
import { BlocksModule } from './blocks/blocks.module';
import { DeliveryModule } from './delivery/delivery.module';
import { EventsModule } from './events/events.module';
import { ExplorerModule } from './explorer/explorer.module';
import { AllocationModule } from './allocation/allocation.module';
import { InvoiceModule } from './invoice/invoice.module';
import { ChaincodeHealthcheck } from './health/chaincode.health';
import { PeerModule } from './peer/peer.module';
import { BaseContractModule } from './baseContract/allocation.module';
import { FacilityModule } from './facility/facility.module';

declare module 'express' {
  interface Request {
    user: { sub: string };
  }
}

@Module({
  imports: [
    EventEmitterModule.forRoot({ wildcard: true }),
    ConfigModule.forRoot({ isGlobal: true }),
    EventsModule,
    BaseContractModule,
    PassportModule,
    IdentityModule,
    LedgerModule,
    PeerModule,
    TradeModule,
    TransactionsModule,
    FacilityModule,
    BlocksModule,
    TerminusModule,
    ChannelModule,
    DeliveryModule,
    InvoiceModule,
    ExplorerModule,
    AllocationModule,
  ],
  controllers: [HealthController],
  providers: [
    ChaincodeHealthcheck,
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
