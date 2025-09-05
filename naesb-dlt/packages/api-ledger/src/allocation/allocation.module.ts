import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { AllocationController } from './allocation.controller';
import { AllocationService } from './allocation.service';

@Module({
  imports: [LedgerModule],
  controllers: [AllocationController],
  providers: [AllocationService],
})
export class AllocationModule {}
