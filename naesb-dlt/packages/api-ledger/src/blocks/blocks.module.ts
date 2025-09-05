import { Module } from '@nestjs/common';
import { LedgerModule } from '../ledger/ledger.module';
import { BlocksController } from './blocks.controller';

@Module({
  imports: [LedgerModule],
  controllers: [BlocksController],
})
export class BlocksModule {}
