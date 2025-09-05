import { Module } from '@nestjs/common';
import { AgentModule, DbModule } from '@shared/agent-utils';
import { CredentialDefinitionController } from './credentialDefinition.controller';
import { CredentialDefinitionService } from './credentialDefinition.service';

@Module({
  imports: [AgentModule, DbModule],
  providers: [CredentialDefinitionService],
  controllers: [CredentialDefinitionController],
})
export class CredentialDefinitionModule {}
