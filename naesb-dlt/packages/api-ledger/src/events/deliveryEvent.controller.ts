/* eslint-disable @typescript-eslint/naming-convention */
import { Controller } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IDeliveryAllocation } from '@naesb/dlt-model';
import { logger } from '@shared/server-utils';
import { Repository } from 'typeorm';
import { EventPattern } from '@nestjs/microservices';
import { IChaincodeEvent } from './blockUtil';
import { env } from '../env';
import { DeliveryAllocation } from '../db/deliveryAllocation.entity';
import { Delivery } from '../db/delivery.entity';

@Controller('DeliveryEvents')
export class DeliveryEventsController {
  constructor(
    @InjectRepository(Delivery)
    private deliveryRepository: Repository<Delivery>,
    @InjectRepository(DeliveryAllocation)
    private deliveryAllocationRepository: Repository<DeliveryAllocation>,
  ) {}

  @EventPattern(`${env.KAFKA_CLIENT_NAME}.ledger.event.contract.DeliveryEvent`)
  async handleDeliveryEvent(event: {
    event: IChaincodeEvent;
    channel_id: string;
  }) {
    await this.deliveryHandler(event);
  }

  @EventPattern(
    `${env.KAFKA_CLIENT_NAME}.ledger.event.contract.DeliveryScheduleEvent`,
  )
  async handleDeliveryScheduleEvent(event: {
    event: IChaincodeEvent;
    channel_id: string;
  }) {
    await this.deliveryHandler(event);
  }

  async deliveryHandler({
    event,
    channel_id,
  }: {
    event: IChaincodeEvent;
    channel_id: string;
  }) {
    const { Name, Payload } = event;
    try {
      const delivery = this.deliveryRepository.create({
        ...JSON.parse(Payload),
        ChannelId: channel_id,
      } as Delivery);
      await this.deliveryRepository.save(delivery);
    } catch (e) {
      logger.error(e.message);
    }
    logger.info(`finished processing ${Name} event on channel ${channel_id}`);
  }

  @EventPattern(
    `${env.KAFKA_CLIENT_NAME}.ledger.event.contract.DeliveryAllocationEvent`,
  )
  async handleDeliveryAllocationEvent({
    event,
    channel_id,
  }: {
    event: IChaincodeEvent;
    channel_id: string;
  }) {
    const { Name, Payload } = event;
    try {
      const allocation = JSON.parse(Payload);
      const deliveryAllocation = this.deliveryAllocationRepository.create({
        ...allocation,
        AllocationId: `${allocation.DeliveryId}_${allocation.DealId}`,
        ChannelId: channel_id,
      } as DeliveryAllocation);
      await this.deliveryAllocationRepository.save(deliveryAllocation);
    } catch (e) {
      logger.error(e.message);
    }
    logger.info(`finished processing ${Name} event on channel ${channel_id}`);
  }

  @EventPattern(
    `${env.KAFKA_CLIENT_NAME}.ledger.event.contract.DeliveryAllocationsEvent`,
  )
  async handleDeliveryAllocationsEvent({
    event,
    channel_id,
  }: {
    event: IChaincodeEvent;
    channel_id: string;
  }) {
    const { Name, Payload } = event;
    try {
      const {
        DeliveryId,
        Allocations,
      }: {
        DeliveryId: string;
        Allocations: Array<IDeliveryAllocation>;
      } = JSON.parse(Payload);
      const deliveryAllocation = this.deliveryAllocationRepository.create(
        Allocations.map((allocation) => ({
          ...allocation,
          AllocationId: `${allocation.DeliveryId}_${allocation.DealId}`,
          ChannelId: channel_id,
          DeliveryId,
        })) as Array<IDeliveryAllocation>,
      );
      await this.deliveryAllocationRepository.save(deliveryAllocation);
    } catch (e) {
      logger.error(e.message);
    }
    logger.info(`finished processing ${Name} event on channel ${channel_id}`);
  }
}
