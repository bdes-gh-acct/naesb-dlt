import { Controller, Get, Param } from '@nestjs/common';
import { LedgerService } from '../ledger/ledger.service';

@Controller('channels/:channelId/blocks')
export class BlocksController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get(':blockId')
  getChannelInfo(
    @Param()
    { channelId, blockId }: { channelId: string; blockId: string },
  ) {
    return this.ledgerService.queryBlock({
      channel: channelId,
      block: Number(blockId),
    });
  }
}
