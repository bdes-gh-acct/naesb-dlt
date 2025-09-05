import { Module } from '@nestjs/common';
import { ConsulModule } from 'src/consul/consul.module';
import { VaultModule } from 'src/vault/vault.module';
import { OrdererService } from './orderer.service';

@Module({
  imports: [VaultModule, ConsulModule],
  controllers: [],
  providers: [OrdererService],
  exports: [OrdererService],
})
export class OrdererModule {}
