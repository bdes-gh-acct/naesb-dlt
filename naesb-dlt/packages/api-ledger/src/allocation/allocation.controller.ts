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
import {
  ICreateDeliveryAllocationRequest,
  IUpdateDeliveryAllocationRequest,
} from '@naesb/dlt-model';
import { AllocationService } from './allocation.service';

@ApiTags('Allocations')
@Controller('channels/:channelId/allocations')
export class AllocationController {
  constructor(private readonly allocationService: AllocationService) {}

  @Get()
  async listAllocations(
    @Param()
    { channelId }: { channelId: string },
  ) {
    return this.allocationService.listAllocations(channelId);
  }

  @Get(':allocationId')
  async getAllocation(
    @Param()
    { channelId, allocationId }: { channelId: string; allocationId: string },
  ) {
    return this.allocationService.getAllocation(allocationId, channelId);
  }

  @Post()
  async createAllocation(
    @Body() body: ICreateDeliveryAllocationRequest,
    @Param() { channelId }: { channelId: string },
    @Req() { user }: Request,
  ) {
    const response = await this.allocationService.createAllocation(
      channelId,
      body,
      user.sub,
    );
    if (response.success) {
      return response;
    }
    throw new BadRequestException(response);
  }

  @Post(':allocationId')
  async updateAllocation(
    @Body()
    body: Omit<IUpdateDeliveryAllocationRequest, 'DealId' | 'DeliveryId'>,
    @Req() { user }: Request,
    @Param()
    { channelId, allocationId }: { channelId: string; allocationId: string },
  ) {
    if (!allocationId.includes('_')) {
      throw new BadRequestException('Invalid allocation id');
    }
    const DealId = allocationId.split('_')[1];
    const DeliveryId = allocationId.split('_')[0];
    const response = await this.allocationService.updateAllocation(
      channelId,
      { ...body, DealId, DeliveryId },
      user.sub,
    );
    if (response.success) {
      return response;
    }
    throw new BadRequestException(response);
  }
}
