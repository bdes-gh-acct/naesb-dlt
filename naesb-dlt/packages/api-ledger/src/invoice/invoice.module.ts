import { Module } from '@nestjs/common';
import { PriceModule } from '../price/price.module';
import { DbModule } from '../db/db.module';
import { LedgerModule } from '../ledger/ledger.module';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';

@Module({
  imports: [LedgerModule, DbModule, PriceModule],
  controllers: [InvoiceController],
  providers: [InvoiceService],
})
export class InvoiceModule {}
