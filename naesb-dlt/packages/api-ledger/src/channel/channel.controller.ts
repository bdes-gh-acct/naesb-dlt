/* eslint-disable @typescript-eslint/require-await */
import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express';
import { Repository } from 'typeorm';
import { Public } from '@shared/server-utils';
import { Channel } from '../db/channel.entity';
import { PeerService } from '../peer/peer.service';
import { ChaincodeService } from '../peer/chaincode.service';
import {
  AckChannelParams,
  ChannelService,
  CreateChannelParams,
  InviteChannelParams,
  ReplyChannelParams,
} from './channel.service';

@Controller('channels')
export class ChannelsController {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    private readonly peerService: PeerService,
    private readonly chaincodeService: ChaincodeService,
    private readonly channelService: ChannelService,
  ) {}

  @Get(':channelId')
  async getChannel(@Param() { channelId }: { channelId: string }) {
    return this.channelRepository.findOne({
      where: { ChannelId: channelId },
      relations: { Contracts: true, Members: true },
    });
  }

  @Get(':channelId/Details')
  async getChannelInfo(@Param() { channelId }: { channelId: string }) {
    return this.channelService.getChannelInfo(channelId);
  }

  @Get(':channelId/msps')
  async getChannelMsps(@Param() { channelId }: { channelId: string }) {
    return this.peerService.getChannelDetails(channelId);
  }

  @Post('')
  async create(
    @Body()
    params: CreateChannelParams,
  ) {
    return this.channelService.create(params);
  }

  @Public()
  @Post('Invite')
  async invite(
    @Body()
    body: InviteChannelParams,
  ) {
    return this.channelService.invite(body);
  }

  @Post('Reply')
  async reply(
    @Body()
    body: ReplyChannelParams,
    @Req() { headers: { authorization } }: Request,
  ) {
    return this.channelService.reply(authorization as string, body);
  }

  @Post('Ack')
  async ack(
    @Req() { headers: { authorization } }: Request,
    @Body()
    body: AckChannelParams,
  ) {
    await this.channelService.ack(authorization as string, body);
  }

  @Public()
  @Post('Join')
  async join(
    @Body()
    body: {
      channelId: string;
      configTx: string;
      additionalInfo: {
        parties: Array<{ name: string; msp: string }>;
      };
    },
  ) {
    await this.channelService.join(body);
  }

  @Get()
  async listChannels() {
    const [data, totalRecords] = await this.channelRepository.findAndCount({
      relations: { Contracts: true, Members: true },
    });
    return { data, totalRecords, timestamp: new Date().toISOString() };
  }

  @Get(':channelId/contracts')
  async getContracts(@Param() { channelId }: { channelId: string }) {
    const result = await this.peerService.getChannelDetails(channelId);
    return result;
  }

  @Public()
  @Post(':channelId/contracts/install')
  async installContract(
    @Body() { label, version }: { label: string; version: string },
  ) {
    await this.chaincodeService.installContract(label, version);
  }

  @Public()
  @Post(':channelId/contracts/approve')
  async approveChaincode(
    @Param() { channelId }: { channelId: string },
    @Body()
    {
      label,
      version,
      endorsementPolicy,
      caCert,
      sequence,
    }: {
      label: string;
      version: string;
      endorsementPolicy?: string;
      caCert: string;
      sequence: number;
    },
  ) {
    await this.chaincodeService.approveContract({
      channelId,
      endorsementPolicy,
      label,
      version,
      sequence,
      caCert,
    });
  }

  @Public()
  @Post(':channelId/contracts/commit')
  async commitChaincode(
    @Param() { channelId }: { channelId: string },
    @Body()
    {
      label,
      version,
      endorsementPolicy,
      sequence,
      peerInfo,
    }: {
      label: string;
      version: string;
      endorsementPolicy?: string;
      sequence: number;
      peerInfo: {
        peers: Array<string>;
        tlsCerts: Array<{ id: string; cert: string }>;
      };
    },
  ) {
    await this.chaincodeService.commitChaincode({
      channelId,
      endorsementPolicy,
      label,
      version,
      sequence,
      peerInfo,
    });
  }

  @Public()
  @Post(':channelId/contracts/init')
  async initChaincode(
    @Param() { channelId }: { channelId: string },
    @Body()
    {
      label,
      peerInfo,
    }: {
      label: string;
      peerInfo: {
        peers: Array<string>;
        tlsCerts: Array<{ id: string; cert: string }>;
      };
    },
  ) {
    console.log('initiating chaincode');
    await this.chaincodeService.initChaincode({ peerInfo, label, channelId });
  }

  @Get(':channelId/contracts/installed')
  async getInstalledChaincodes() {
    await this.chaincodeService.queryInstalledChaincodes();
  }

  @Get(':channelId/contracts/approved')
  async getApprovedChaincodes(
    @Query() { label }: { label: string },
    @Param() { channelId }: { channelId: string },
  ) {
    console.log(`Querying approved chaincodes for ${label}`);
    await this.chaincodeService.queryApprovedChaincodes(channelId, label);
  }

  @Get(':channelId/contracts/committed')
  async getCommittedChaincodes(@Param() { channelId }: { channelId: string }) {
    await this.chaincodeService.queryCommittedChaincodes(channelId);
  }
}
