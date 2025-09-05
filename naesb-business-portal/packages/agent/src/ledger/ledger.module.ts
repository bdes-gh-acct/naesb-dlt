import { Module } from '@nestjs/common';
import { AgentModule } from '@shared/agent-utils';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';

@Module({
  imports: [AgentModule],
  providers: [LedgerService],
  controllers: [LedgerController],
})
export class LedgerModule {}
