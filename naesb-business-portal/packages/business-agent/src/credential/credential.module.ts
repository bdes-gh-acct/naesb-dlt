import { Module } from '@nestjs/common';
import { AgentModule, DbModule } from '@shared/agent-utils';
import { CredentialController } from './credential.controller';
import { CredentialService } from './credential.service';

@Module({
  imports: [AgentModule, DbModule],
  providers: [CredentialService],
  controllers: [CredentialController],
})
export class CredentialModule {}
