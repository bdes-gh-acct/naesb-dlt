import { Injectable } from '@nestjs/common';
import { AgentService } from '@shared/agent-utils';

@Injectable()
export class WalletService {
  constructor(private readonly agentService: AgentService) {}
  async getPublicDid() {
    return this.agentService.getPublicDid();
  }
}
