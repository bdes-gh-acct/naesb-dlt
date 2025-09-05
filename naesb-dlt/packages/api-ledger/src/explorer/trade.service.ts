import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryResultDto } from '@shared/server-utils';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Trade } from '../db/trade.entity';

@Injectable()
export class TradeService {
  constructor(
    @InjectRepository(Trade)
    private repository: Repository<Trade>,
  ) {}

  async findMany(
    options: FindManyOptions<Trade>,
  ): Promise<QueryResultDto<Trade>> {
    const [data, totalRecords] = await this.repository.findAndCount(options);
    return new QueryResultDto<Trade>({ data, totalRecords });
  }

  async findOne(
    id: string,
    options?: FindOneOptions<Trade>,
  ): Promise<Trade | null> {
    return this.repository.findOne({ where: { DealId: id }, ...options });
  }
}
