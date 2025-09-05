import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryResultDto } from '@shared/server-utils';
import { DeliveryAllocation } from 'src/db/deliveryAllocation.entity';
import { FindManyOptions, Repository } from 'typeorm';

@Injectable()
export class DeliveryAllocationService {
  constructor(
    @InjectRepository(DeliveryAllocation)
    private repository: Repository<DeliveryAllocation>,
  ) {}

  async findMany(
    options: FindManyOptions<DeliveryAllocation>,
  ): Promise<QueryResultDto<DeliveryAllocation>> {
    const [data, totalRecords] = await this.repository.findAndCount(options);
    return new QueryResultDto<DeliveryAllocation>({ data, totalRecords });
  }

  async findOne(id: string): Promise<DeliveryAllocation | null> {
    return this.repository.findOne({ where: { AllocationId: id } });
  }
}
