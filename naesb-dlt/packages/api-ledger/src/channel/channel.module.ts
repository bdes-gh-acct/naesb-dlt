import { Module } from '@nestjs/common';
import { HttpModule } from '@shared/server-utils';
import { LedgerModule } from '../ledger/ledger.module';
import { ChannelsController } from './channel.controller';
import { DbModule } from '../db/db.module';
import { PeerModule } from '../peer/peer.module';
import { ChannelService } from './channel.service';
import { BrokerModule } from '../broker/broker.module';

@Module({
  imports: [
    LedgerModule,
    DbModule,
    HttpModule,
    PeerModule,
    PeerModule,
    DbModule,
    BrokerModule,
  ],
  controllers: [ChannelsController],
  providers: [ChannelService],
})
export class ChannelModule {}
