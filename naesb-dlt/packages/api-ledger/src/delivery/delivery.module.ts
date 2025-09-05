import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { DeliveryController } from './delivery.controller';
import { DeliveryService } from './delivery.service';
import { RegistryModule } from '../registry/registry.module';

@Module({
  imports: [LedgerModule, RegistryModule],
  controllers: [DeliveryController],
  providers: [DeliveryService],
})
export class DeliveryModule {}
