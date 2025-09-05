/* eslint-disable @typescript-eslint/naming-convention */
import { InjectRepository } from '@nestjs/typeorm';
import { logger } from '@shared/server-utils';
import { Repository } from 'typeorm';
import { Controller } from '@nestjs/common';
import * as asyncUtil from 'async';
import * as retry from 'async-retry';
import { EventPattern } from '@nestjs/microservices';
import { IChaincodeEvent } from './blockUtil';
import { ChannelFacility } from '../db/facility.entity';

@Controller('FacilityEvents')
export class FacilityEventsController {
  private queue: any;

  constructor(
    @InjectRepository(ChannelFacility)
    private channelFacilityRepository: Repository<ChannelFacility>,
  ) {
    this.queue = asyncUtil.queue(
      async (
        { event, channel_id }: { event: IChaincodeEvent; channel_id: string },
        callback: any,
      ) => {
        try {
          if (event.Payload) {
            const facility: ChannelFacility = JSON.parse(
              event.Payload?.toString(),
            );
            const facilityEntity = {
              // @ts-ignore
              ChannelId: channel_id,
              ...facility,
            };
            await retry(async () => {
              await this.channelFacilityRepository.save(facilityEntity);
            });
          }
        } catch (e) {
          logger.error(e.message);
        }
        callback();
      },
      1,
    );
  }

  @EventPattern('ledger.event.contract.FacilityEvent')
  handleTrade({
    event,
    channel_id,
  }: {
    event: IChaincodeEvent;
    channel_id: string;
  }) {
    this.queue.push({ event, channel_id }, () => {
      logger.info('finished processing facility event');
    });
  }
}
