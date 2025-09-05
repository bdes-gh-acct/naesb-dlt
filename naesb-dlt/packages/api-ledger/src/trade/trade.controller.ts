/* eslint-disable import/no-extraneous-dependencies */
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import {
  ChangeTypeStatusCode,
  ICreateTradeRequest,
  IUpdateTradeRequest,
} from '@naesb/dlt-model';
import { Request } from 'express';
import { v4 } from 'uuid';
import { TradeService } from './trade.service';

@Controller('channels/:channelId/trades')
export class TradeController {
  constructor(private readonly tradeService: TradeService) {}

  @Get(':tradeId/history')
  async getTradeHistory(
    @Param() { channelId, tradeId }: { channelId: string; tradeId: string },
    @Req() { user }: Request,
  ) {
    return this.tradeService.getTradeHistory(tradeId, channelId, user.sub);
  }

  @Get(':tradeId')
  async getTrade(
    @Param() { channelId, tradeId }: { channelId: string; tradeId: string },
    @Req() { user }: Request,
  ) {
    return this.tradeService.getTrade(tradeId, channelId, user.sub);
  }

  @Post('search')
  async searchTrades(
    @Param() { channelId }: { channelId: string },
    @Body() { Ids }: any,
    @Req() { user }: Request,
  ) {
    return this.tradeService.queryTrades({ Ids }, channelId, user.sub);
  }

  @Post(':dealId')
  async reviseTrade(
    @Param() { channelId, dealId }: { channelId: string; dealId: string },
    @Body() { ChangeType, ...rest }: IUpdateTradeRequest,
    @Req() { user }: Request,
  ) {
    return ChangeType === ChangeTypeStatusCode.ACCEPT
      ? this.tradeService.acceptTrade(
          { ...rest, DealId: dealId },
          channelId,
          user.sub,
        )
      : this.tradeService.reviseTrade({ DealId: dealId }, channelId, user.sub);
  }

  @Delete(':dealId')
  async voidTrade(
    @Param() { channelId, dealId }: { channelId: string; dealId: string },
    @Req() { user }: Request,
  ) {
    return this.tradeService.voidTrade({ DealId: dealId }, channelId, user.sub);
  }

  @Get()
  async listTrades(
    @Param() { channelId }: { channelId: string },
    @Req() { user }: Request,
  ) {
    return this.tradeService.listTrades(channelId, user.sub);
  }

  @Post()
  async initiateTrade(
    @Body() request: ICreateTradeRequest,
    @Param() { channelId }: { channelId: string },
    @Req() { user }: Request,
  ) {
    const response = await this.tradeService.createTrade(
      { ...request, DealId: v4() },
      channelId,
      user.sub,
    );
    if (response.success) {
      return response;
    }
    throw new BadRequestException(response);
  }
}
