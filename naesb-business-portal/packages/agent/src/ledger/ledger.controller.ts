import { Body, Controller, Post } from '@nestjs/common';
import { RegisterNymRequest } from '@shared/agent-utils';
import { LedgerService } from './ledger.service';

@Controller('Ledger')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Post('/nym/register')
  public async getNaesb(@Body() options: RegisterNymRequest) {
    return this.ledgerService.registerNym(options);
  }
}
