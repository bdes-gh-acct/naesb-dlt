/* eslint-disable @typescript-eslint/naming-convention */
import { Controller, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { logger } from '@shared/server-utils';
import { ContractEvent } from 'fabric-network';
import { Repository } from 'typeorm';
import { ITradeViewModel, IInvoice, IInvoiceDetail } from '@naesb/dlt-model';
import * as asyncUtil from 'async';
import * as retry from 'async-retry';
import { EventPattern } from '@nestjs/microservices';
import { InvoiceDetail } from '../db/invoiceDetail.entity';
import { Invoice } from '../db/invoice.entity';
import { TradeService } from '../trade/trade.service';
import { env } from '../env';

const { ORG_MSP_ID } = env;

@Controller('InvoiceEvents')
export class InvoiceEventsController {
  private detailQueue: any;

  private invoiceQueue: any;

  constructor(
    @InjectRepository(InvoiceDetail)
    private invoiceDetailRepository: Repository<InvoiceDetail>,
    @InjectRepository(Invoice)
    private invoiceRepository: Repository<Invoice>,
    private tradeService: TradeService,
  ) {
    this.detailQueue = asyncUtil.queue(
      async (
        { event, channel_id }: { event: ContractEvent; channel_id: string },
        callback: any,
      ) => {
        if (event.payload) {
          const detail: IInvoiceDetail = JSON.parse(event.payload.toString());
          try {
            await retry(async () => {
              await this.invoiceDetailRepository.save({
                ...detail,
                ChannelId: channel_id,
              });
            });
          } catch (e) {
            logger.error(e);
          }
        }
        callback();
      },
      1,
    );
    this.invoiceQueue = asyncUtil.queue(
      async (
        { event, channel_id }: { event: ContractEvent; channel_id: string },
        callback: any,
      ) => {
        if (event.payload) {
          const { Details = [], ...rest }: IInvoice = JSON.parse(
            event.payload?.toString(),
          );
          try {
            let deals = [];
            try {
              const { data: dealData } = await this.tradeService.queryTrades(
                {
                  Ids: Details.map((detail) => detail.DealId),
                },
                channel_id,
              );
              deals = JSON.parse(dealData as string);
            } catch (e) {
              logger.info('failed to query trades');
              logger.error(e);
            }
            const dealMap = (deals || []).reduce(
              (
                acc: Record<string, ITradeViewModel>,
                deal: ITradeViewModel,
              ) => ({
                ...acc,
                [deal.DealId]: deal,
              }),
              {},
            );
            const totals = Details.reduce(
              (acc: { value: number; gross: number; net: number }, detail) => {
                const deal: ITradeViewModel = dealMap[detail.DealId];
                const isBuy = deal?.BuyerDealId === ORG_MSP_ID;
                return {
                  value:
                    acc.value +
                    (isBuy ? -Math.abs(detail.Quantity) : detail.Quantity) *
                      detail.Price,
                  net:
                    acc.net +
                    (isBuy ? detail.Quantity : -Math.abs(detail.Quantity)),
                  gross: acc.gross + detail.Quantity,
                };
              },
              { value: 0, gross: 0, net: 0 },
            );

            await retry(async () => {
              const result = await this.invoiceRepository.save({
                ...rest,
                ChannelId: channel_id,
                GrossVolume: totals.gross,
                NetVolume: totals.net,
                Value: totals.value,
              });
              logger.info(result);
            });
          } catch (e) {
            logger.error(e);
          }
          await Promise.all(
            (Details || []).map((detail) =>
              retry(async () => {
                await this.invoiceDetailRepository.save({
                  ...detail,
                  ChannelId: channel_id,
                });
              }),
            ),
          );
        }
        logger.info('completed queue invoice');
        callback();
      },
      1,
    );
  }

  @EventPattern('ledger.event.contract.InvoiceDetailEvent')
  handeInvoiceDetail({
    event,
    channel_id,
  }: {
    event: ContractEvent;
    channel_id: string;
  }) {
    logger.info(
      `${event.eventName} event from ${event.chaincodeId} on ${channel_id} received`,
    );
    this.detailQueue.push({ event, channel_id }, () => {
      logger.info('finished processing invoice detail');
    });
  }

  @EventPattern('ledger.event.contract.InvoiceEvent')
  handleInvoiceEvent({
    event,
    channel_id,
  }: {
    event: ContractEvent;
    channel_id: string;
  }) {
    logger.info(
      `${event.eventName} event from ${event.chaincodeId} on ${channel_id} received`,
    );
    this.invoiceQueue.push({ event, channel_id }, () => {
      logger.info('finished processing invoice');
    });
  }
}
