import { Module } from '@nestjs/common';
import { HttpModule } from '@shared/server-utils';
import { LedgerService } from './ledger.service';

@Module({
  imports: [
    HttpModule.register({
      retries: 5,
    }),
  ],
  providers: [LedgerService],
  exports: [LedgerService],
})
export class LedgerModule {}
