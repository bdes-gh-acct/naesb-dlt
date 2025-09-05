import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { OrdererHealthCheck } from './orderer.health';
import { OrdererModule } from 'src/orderer/orderer.module';
import { ChannelHealthCheck } from './channel.health';
import { ChannelModule } from 'src/channel/channel.module';

@Module({
  imports: [TerminusModule, OrdererModule, ChannelModule],
  controllers: [HealthController],
  providers: [OrdererHealthCheck, ChannelHealthCheck],
})
export class HealthModule {}
