import { Module } from '@nestjs/common';
import { ConsulModule } from 'src/consul/consul.module';
import { VaultModule } from 'src/vault/vault.module';
import { ChannelService } from './channel.service';
import { ChannelsController } from './channel.controller';

@Module({
  imports: [VaultModule, ConsulModule],
  controllers: [ChannelsController],
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
