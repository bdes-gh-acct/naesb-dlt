import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryResultDto } from '@shared/server-utils';
import { Commodity } from '@naesb/dlt-model';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { BaseContract } from '../db/baseContract.entity';

@Injectable()
export class BaseContractService {
  constructor(
    @InjectRepository(BaseContract)
    private repository: Repository<BaseContract>,
  ) {}

  async findMany(
    options: FindManyOptions<BaseContract>,
  ): Promise<QueryResultDto<BaseContract>> {
    const [data, totalRecords] = await this.repository.findAndCount(options);
    return new QueryResultDto<BaseContract>({ data, totalRecords });
  }

  async findOne(
    channelId: string,
    commodity: Commodity,
    options?: FindOneOptions<BaseContract>,
  ): Promise<BaseContract | null> {
    return this.repository.findOne({
      where: { Commodity: commodity, ChannelId: channelId },
      ...options,
    });
  }
}
