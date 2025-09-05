import { Module } from '@nestjs/common';
import { DbModule } from '../db';
import { CredentialDefinitionService } from './credentialDefinition.service';
import { DidService } from './did.service';
import { LedgerController } from './ledger.controller';
import { LedgerService } from './ledger.service';
import { SchemaService } from './schema.service';
import { SyncService } from './sync.service';
import { TransactionService } from './transaction.service';

@Module({
  imports: [DbModule],
  providers: [
    TransactionService,
    LedgerService,
    SyncService,
    DidService,
    SchemaService,
    CredentialDefinitionService,
  ],
  exports: [
    TransactionService,
    LedgerService,
    DidService,
    SchemaService,
    CredentialDefinitionService,
  ],
  controllers: [LedgerController],
})
export class LedgerModule {}
