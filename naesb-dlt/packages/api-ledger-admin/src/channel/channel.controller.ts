/* eslint-disable @typescript-eslint/require-await */
import { Body, Controller, Post } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { OrganizationYAML } from 'src/orderer/configTx';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelService: ChannelService) {}

  @Post('')
  async create(
    @Body()
    {
      ChannelId,
      organizations,
    }: {
      ChannelId: string;
      organizations: Array<OrganizationYAML>;
    },
  ) {
    await this.channelService.createChannel(ChannelId, organizations);
  }
}
