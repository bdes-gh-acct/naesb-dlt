/* eslint-disable @typescript-eslint/naming-convention */
import { Controller, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { logger } from '@shared/server-utils';
import { Repository } from 'typeorm';
import { ITrade } from '@naesb/dlt-model';
import * as retry from 'async-retry';
import { EventPattern } from '@nestjs/microservices';
import { transformTrade } from '../trade/util';
import { Trade } from '../db/trade.entity';
import { IChaincodeEvent } from './blockUtil';
import { TradeFacility } from '../db/tradeFacility.entity';
import { env } from '../env';

@Controller('TradeEvents')
export class TradeEventController {
  constructor(
    @InjectRepository(Trade)
    private tradeRepository: Repository<Trade>,
    @InjectRepository(TradeFacility)
    private tradeFacilityRepository: Repository<TradeFacility>,
  ) {}

  @EventPattern(`${env.KAFKA_CLIENT_NAME}.ledger.event.contract.TradeEvent`)
  async handleTrade({
    event,
    channel_id,
  }: {
    event: IChaincodeEvent;
    channel_id: string;
  }) {
    try {
      if (event.Payload) {
        const trade: ITrade = JSON.parse(event.Payload?.toString());
        let Facilities: Array<{
          ChannelId: string;
          FacilityId: string;
          DealId: string;
        }> = [];
        if (trade.Facilities) {
          Facilities = (JSON.parse(trade.Facilities) as Array<string>).map(
            (facility) => ({
              FacilityId: facility,
              DealId: trade.DealId,
              ChannelId: channel_id,
            }),
          );
        }
        const tradeEntity = transformTrade({
          ChannelId: channel_id,
          ...trade,
        });
        await retry(async () => {
          await this.tradeFacilityRepository.delete({
            DealId: trade.DealId,
          });
        });
        if (Facilities?.length) {
          await retry(async () => {
            await this.tradeFacilityRepository.save(Facilities);
          });
        }
        await retry(async () => {
          await this.tradeRepository.save(tradeEntity);
        });
      }
    } catch (e) {
      logger.error(e.message);
    }
    logger.info('finished processing trade event');
  }
}
