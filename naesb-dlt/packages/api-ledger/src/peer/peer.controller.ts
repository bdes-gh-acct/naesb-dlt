/* eslint-disable no-void */
/* eslint-disable @typescript-eslint/require-await */
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ChaincodeService } from './chaincode.service';

@Controller('Peers')
export class PeersController {
  constructor(private readonly chaincodeService: ChaincodeService) {}

  @Get(':channelId/contracts')
  async getContracts(@Param() { channelId }: { channelId: string }) {
    return this.chaincodeService.queryCommittedChaincodes(channelId);
  }

  @Post(':channelId/contracts/install')
  async installContract(
    @Body() { label, version }: { label: string; version: string },
  ) {
    await this.chaincodeService.installContract(label, version);
  }
}
