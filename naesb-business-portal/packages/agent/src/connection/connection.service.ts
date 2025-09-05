import { Injectable } from '@nestjs/common';
import { AgentService } from '@shared/agent-utils';

export interface IGetCreatedSchemasRequest {
  schema_id?: string;
  schema_issuer_did?: string;
  schema_name?: string;
  schema_version?: string;
}

@Injectable()
export class ConnectionService {
  constructor(private readonly agentService: AgentService) {}
  async createPublicInvitation() {
    return this.agentService.createInvitation({
      public: true,
      auto_accept: true,
    });
  }
}
