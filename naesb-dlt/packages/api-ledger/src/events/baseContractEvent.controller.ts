/* eslint-disable @typescript-eslint/naming-convention */
import { Controller } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { logger } from '@shared/server-utils';
import { Repository } from 'typeorm';
import { IBaseContract } from '@naesb/dlt-model';
import * as retry from 'async-retry';
import { EventPattern } from '@nestjs/microservices';
import { IChaincodeEvent } from './blockUtil';
import { BaseContract } from '../db/baseContract.entity';
import { env } from '../env';

@Controller('BaseContractEvents')
export class BaseContractEventController {
  constructor(
    @InjectRepository(BaseContract)
    private baseContractRepository: Repository<BaseContract>,
  ) {}

  @EventPattern(
    `${env.KAFKA_CLIENT_NAME}.ledger.event.contract.BaseContractEvent`,
  )
  async handleTrade({
    event,
    channel_id,
  }: {
    event: IChaincodeEvent;
    channel_id: string;
  }) {
    try {
      if (event.Payload) {
        const contract: IBaseContract = JSON.parse(event.Payload?.toString());
        const tradeEntity = {
          ChannelId: channel_id,
          ...contract,
        };
        await retry(async () => {
          await this.baseContractRepository.save(tradeEntity);
        });
      }
    } catch (e) {
      logger.error(e.message);
    }
    logger.info('finished processing base contract event event');
  }
}
