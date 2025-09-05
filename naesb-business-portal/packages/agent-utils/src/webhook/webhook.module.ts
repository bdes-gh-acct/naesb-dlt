import { Module } from '@nestjs/common';
import { DbModule } from '../db';
import { SaveCredentialService } from './credential.service';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { AgentModule } from '../agent';
import { CredentialProofService } from './credentialProof.service';
import { BrokerModule } from '../broker/broker.module';

@Module({
  imports: [DbModule, AgentModule, BrokerModule],
  providers: [WebhookService, SaveCredentialService, CredentialProofService],
  controllers: [WebhookController],
})
export class WebhookModule {}
