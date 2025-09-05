import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryResultDto } from '@shared/server-utils';
import { FindManyOptions, Repository } from 'typeorm';
import { ChannelMember } from 'src/db/channelMember.entity';

@Injectable()
export class ChannelMemberService {
  constructor(
    @InjectRepository(ChannelMember)
    private repository: Repository<ChannelMember>,
  ) {}

  async findMany(
    options: FindManyOptions<ChannelMember>,
  ): Promise<QueryResultDto<ChannelMember>> {
    const [data, totalRecords] = await this.repository.findAndCount(options);
    return new QueryResultDto<ChannelMember>({ data, totalRecords });
  }
}
