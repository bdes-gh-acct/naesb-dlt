import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { LedgerModule, WebhookModule } from '@shared/agent-utils';
import { CertificateModule } from './certificate/certificate.module';
import { ConnectionModule } from './connection/connection.module';
import { CredentialModule } from './credential/credential.module';
import { CredentialDefinitionModule } from './credentialDefinition/credentialDefinition.module';
import { HealthController } from './health/health.controller';
import { SchemaModule } from './schema/schema.module';
import { WalletModule } from './wallet/wallet.module';

@Module({
  imports: [
    TerminusModule,
    SchemaModule,
    ConnectionModule,
    LedgerModule,
    WalletModule,
    CredentialDefinitionModule,
    CredentialModule,
    WebhookModule,
    CertificateModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
