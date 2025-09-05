import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { BaseContractController } from './baseContract.controller';
import { BaseContractService } from './baseContract.service';

@Module({
  imports: [LedgerModule],
  controllers: [BaseContractController],
  providers: [BaseContractService],
})
export class BaseContractModule {}
