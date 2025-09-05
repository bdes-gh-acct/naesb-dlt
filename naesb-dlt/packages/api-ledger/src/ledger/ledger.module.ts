import { Module } from '@nestjs/common';
import { VaultModule } from '@shared/server-utils';
import { CaModule } from 'src/ca/ca.module';
import { LedgerService } from './ledger.service';

@Module({
  imports: [CaModule, VaultModule],
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}
