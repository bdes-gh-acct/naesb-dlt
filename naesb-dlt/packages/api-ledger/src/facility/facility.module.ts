import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { FacilityController } from './facility.controller';
import { FacilityService } from './facility.service';
import { RegistryModule } from '../registry/registry.module';

@Module({
  imports: [LedgerModule, RegistryModule],
  controllers: [FacilityController],
  providers: [FacilityService],
})
export class FacilityModule {}
