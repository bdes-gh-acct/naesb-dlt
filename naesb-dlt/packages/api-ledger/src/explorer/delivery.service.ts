import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryResultDto } from '@shared/server-utils';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';
import { Delivery } from '../db/delivery.entity';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(Delivery)
    private repository: Repository<Delivery>,
  ) {}

  async findMany(
    options: FindManyOptions<Delivery>,
  ): Promise<QueryResultDto<Delivery>> {
    const [data, totalRecords] = await this.repository.findAndCount(options);
    return new QueryResultDto<Delivery>({ data, totalRecords });
  }

  async findOne(
    id: string,
    options?: FindOneOptions<Delivery>,
  ): Promise<Delivery | null> {
    return this.repository.findOne({ where: { DeliveryId: id }, ...options });
  }
}
