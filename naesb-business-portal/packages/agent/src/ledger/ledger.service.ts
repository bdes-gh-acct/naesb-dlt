import { Injectable } from '@nestjs/common';
import { AgentService, RegisterNymRequest } from '@shared/agent-utils';

@Injectable()
export class LedgerService {
  constructor(private readonly agentService: AgentService) {}
  async registerNym(options: RegisterNymRequest) {
    return this.agentService.registerNym(options);
  }
}
