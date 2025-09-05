import { Controller, Get } from '@nestjs/common';
import * as dotenv from 'dotenv';
import { CredentialDefinitionService } from './credentialDefinition.service';
import { DidService } from './did.service';
import { SchemaService } from './schema.service';
import { SyncService } from './sync.service';
import { TransactionService } from './transaction.service';

dotenv.config();

@Controller('Ledger')
export class LedgerController {
  constructor(
    private readonly syncService: SyncService,
    private readonly transactionService: TransactionService,
    private readonly didService: DidService,
    private readonly schemaService: SchemaService,
    private readonly credentialDefinitionService: CredentialDefinitionService,
  ) {}

  @Get('/transactions')
  public async getTransactions() {
    return this.transactionService.findMany();
  }

  @Get('/dids')
  public async getDids() {
    return this.didService.findMany();
  }

  @Get('/schemas')
  public async getSchemas() {
    return this.schemaService.findMany();
  }

  @Get('/CredentialDefinitions')
  public async getCredentialDefinitions() {
    return this.credentialDefinitionService.findMany();
  }
}
