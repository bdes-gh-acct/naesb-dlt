import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { TransactionsController } from './transactions.controller';

@Module({
  imports: [LedgerModule],
  controllers: [TransactionsController],
})
export class TransactionsModule {}
