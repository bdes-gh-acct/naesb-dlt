/* eslint-disable import/no-extraneous-dependencies */
import { Controller, Get, Param, Req } from '@nestjs/common';
import { Request } from 'express';
import { LedgerService } from '../ledger/ledger.service';

@Controller('channels/:channelId/transactions')
export class TransactionsController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get(':txId')
  async getTransaction(
    @Param()
    { channelId, txId }: { channelId: string; txId: string },
    @Req() { user }: Request,
  ) {
    return this.ledgerService.queryBlockByTransactionId({
      channel: channelId,
      transactionId: txId,
      userId: user.sub,
    });
  }
}
