/* eslint-disable import/no-extraneous-dependencies */
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { v4 } from 'uuid';
import {
  ICreateDeliveryAllocationRequest,
  ICreateDeliveryRequest,
  ISetActualQuantityRequest,
  ISetScheduledQuantityRequest,
} from '@naesb/dlt-model';
import { Request } from 'express';
import { DeliveryService } from './delivery.service';

@ApiTags('Deliveries')
@Controller('channels/:channelId/deliveries')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get()
  async listDeliveries(
    @Param()
    { channelId }: { channelId: string },
    @Req() { user }: Request,
  ) {
    return this.deliveryService.listDeliveries(channelId, user.sub);
  }

  @Get('location/:locationId')
  async listDeliveriesByLocation(
    @Param()
    { channelId, locationId }: { channelId: string; locationId: string },
    @Req() { user }: Request,
    @Query('date') date?: string,
  ) {
    return this.deliveryService.listDeliveriesByLocation({
      location: Number(locationId),
      date,
      channel: channelId,
      userId: user.sub,
    });
  }

  @Get(':deliveryId')
  async getDelivery(
    @Param()
    { channelId, deliveryId }: { channelId: string; deliveryId: string },
    @Req() { user }: Request,
  ) {
    return this.deliveryService.getDelivery(deliveryId, channelId, user.sub);
  }

  @Get(':deliveryId/history')
  async getDeliveryHistory(
    @Param()
    { channelId, deliveryId }: { channelId: string; deliveryId: string },
    @Req() { user }: Request,
  ) {
    return this.deliveryService.getDeliveryHistory(
      deliveryId,
      channelId,
      user.sub,
    );
  }

  @Post()
  async createDelivery(
    @Body() body: ICreateDeliveryRequest,
    @Param() { channelId }: { channelId: string },
    @Req() { user, headers: { authorization } }: Request,
  ) {
    const response = await this.deliveryService.createDelivery(
      { ...body, DeliveryId: v4() },
      channelId,
      user.sub,
      authorization as string,
    );
    if (response.success) {
      return response;
    }
    throw new BadRequestException(response);
  }

  @Post(':deliveryId/schedule')
  async setScheduledQuantity(
    @Body()
    body: Omit<
      ISetScheduledQuantityRequest & ISetActualQuantityRequest,
      'DeliveryId'
    >,
    @Param()
    { channelId, deliveryId }: { channelId: string; deliveryId: string },
    @Req() { user }: Request,
  ) {
    if (
      body.ScheduledQuantity !== undefined &&
      body.ActualQuantity !== undefined
    ) {
      const response = await this.deliveryService.setScheduledQuantities(
        { ...body, DeliveryId: deliveryId },
        channelId,
        user.sub,
      );
      if (response.success) {
        return response;
      }
      throw new BadRequestException(response);
    }
    const response = await this.deliveryService.setScheduledQuantity(
      { ...body, DeliveryId: deliveryId },
      channelId,
      user.sub,
    );
    if (response.success) {
      return response;
    }
    throw new BadRequestException(response);
  }

  @Post(':deliveryId/actual')
  async setActualQuantity(
    @Body() body: Omit<ISetActualQuantityRequest, 'DeliveryId'>,
    @Param()
    { channelId, deliveryId }: { channelId: string; deliveryId: string },
    @Req() { user }: Request,
  ) {
    const response = await this.deliveryService.setActualQuantity(
      { ...body, DeliveryId: deliveryId },
      channelId,
      user.sub,
    );
    if (response.success) {
      return response;
    }
    throw new BadRequestException(response);
  }

  @Post(':deliveryId/allocate')
  async allocate(
    @Body()
    body: {
      DeliveryId: string;
      Allocations: Array<Omit<ICreateDeliveryAllocationRequest, 'DeliveryId'>>;
    },
    @Param()
    { channelId, deliveryId }: { channelId: string; deliveryId: string },
    @Req() { user }: Request,
  ) {
    const response = await this.deliveryService.allocate(
      { ...body, DeliveryId: deliveryId },
      channelId,
      user.sub,
    );
    if (response.success) {
      return response;
    }
    throw new BadRequestException(response);
  }
}
