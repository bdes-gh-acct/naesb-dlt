import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryResultDto } from '@shared/server-utils';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Channel } from 'src/db/channel.entity';

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private repository: Repository<Channel>,
  ) {}

  async findMany(
    options: FindManyOptions<Channel>,
  ): Promise<QueryResultDto<Channel>> {
    const [data, totalRecords] = await this.repository.findAndCount(options);
    return new QueryResultDto<Channel>({ data, totalRecords });
  }

  async findOne(
    id: string,
    options?: FindOneOptions<Channel>,
  ): Promise<Channel | null> {
    return this.repository.findOne({ where: { ChannelId: id }, ...options });
  }
}
