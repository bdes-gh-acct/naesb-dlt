/* eslint-disable import/no-extraneous-dependencies */
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  BadRequestException,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { Commodity, IBaseContract } from '@naesb/dlt-model';
import { BaseContractService } from './baseContract.service';

@ApiTags('Allocations')
@Controller('channels/:channelId/BaseContract')
export class BaseContractController {
  constructor(private readonly baseContractService: BaseContractService) {}

  @Get()
  async listContracts(
    @Param()
    { channelId }: { channelId: string },
  ) {
    return this.baseContractService.listContracts(channelId);
  }

  @Get(':commodity')
  async getContract(
    @Param()
    { channelId, commodity }: { channelId: string; commodity: string },
  ) {
    return this.baseContractService.getContract(commodity, channelId);
  }

  @Post()
  async initiateContract(
    @Body() body: IBaseContract,
    @Param() { channelId }: { channelId: string },
    @Req() { user }: Request,
  ) {
    const response = await this.baseContractService.initiateContract(
      channelId,
      body,
      user.sub,
    );
    if (response.success) {
      return response;
    }
    throw new BadRequestException(response);
  }

  @Post(':commodity/Accept')
  async acceptContract(
    @Req() { user }: Request,
    @Param()
    { channelId, commodity }: { channelId: string; commodity: string },
  ) {
    const response = await this.baseContractService.acceptContract(
      channelId,
      commodity,
      user.sub,
    );
    if (response.success) {
      return response;
    }
    throw new BadRequestException(response);
  }

  @Post(':commodity')
  async reviseContract(
    @Req() { user }: Request,
    @Body() body: IBaseContract,
    @Param()
    { channelId, commodity }: { channelId: string; commodity: string },
  ) {
    const response = await this.baseContractService.reviseContract(
      channelId,
      { ...body, Commodity: commodity as Commodity },
      user.sub,
    );
    if (response.success) {
      return response;
    }
    throw new BadRequestException(response);
  }
}
