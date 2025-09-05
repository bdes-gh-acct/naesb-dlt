import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './health/health.controller';
import { LedgerModule } from './ledger/ledger.module';
import { SchemaModule } from './schema/schema.module';

@Module({
  imports: [TerminusModule, SchemaModule, LedgerModule],
  controllers: [HealthController],
})
export class AppModule {}
