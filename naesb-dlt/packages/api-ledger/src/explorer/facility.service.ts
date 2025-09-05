import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryResultDto } from '@shared/server-utils';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { ChannelFacility } from '../db/facility.entity';

@Injectable()
export class FacilityService {
  constructor(
    @InjectRepository(ChannelFacility)
    private repository: Repository<ChannelFacility>,
  ) {}

  async findMany(
    options: FindManyOptions<ChannelFacility>,
  ): Promise<QueryResultDto<ChannelFacility>> {
    const [data, totalRecords] = await this.repository.findAndCount(options);
    return new QueryResultDto<ChannelFacility>({ data, totalRecords });
  }

  async findOne(
    facilityId: string,
    channelId: string,
    options?: FindOneOptions<ChannelFacility>,
  ): Promise<ChannelFacility | null> {
    return this.repository.findOne({
      where: { FacilityId: facilityId, ChannelId: channelId },
      ...options,
    });
  }
}
