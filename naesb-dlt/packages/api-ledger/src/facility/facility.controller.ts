/* eslint-disable import/no-extraneous-dependencies */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IChannelFacility } from '@naesb/dlt-model';
import { Request } from 'express';
import { EventPattern } from '@nestjs/microservices';
import { FacilityService } from './facility.service';
import { env } from '../env';

@ApiTags('Facilities')
@Controller('Channels/:channelId/Facilities')
export class FacilityController {
  constructor(private readonly facilityService: FacilityService) {}

  @Get()
  async listFacilities(
    @Param()
    { channelId }: { channelId: string },
    @Req() { user }: Request,
  ) {
    return this.facilityService.listFacilities(channelId, user.sub);
  }

  @Get(':facilityId')
  async getFacility(
    @Param()
    { channelId, facilityId }: { channelId: string; facilityId: string },
    @Req() { user }: Request,
  ) {
    return this.facilityService.getFacility(facilityId, channelId, user.sub);
  }

  @Post()
  async createFacility(
    @Body() body: IChannelFacility,
    @Param() { channelId }: { channelId: string },
    @Req() { user }: Request,
  ) {
    const response = await this.facilityService.createFacility(
      body,
      channelId,
      user.sub,
    );
    if (response.success) {
      return response;
    }
    throw new BadRequestException(response);
  }

  @EventPattern(`${env.ORG_ID}.Aries.Proof.Complete`)
  handleTrade(data: any) {
    console.log(`proof completed`, data);
  }
}
