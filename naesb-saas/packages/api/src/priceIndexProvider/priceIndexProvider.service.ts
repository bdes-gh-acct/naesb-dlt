import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { PriceIndexProvider } from '../db/priceIndexProvider.entity';

@Injectable()
export class PriceIndexProviderService {
  constructor(
    @InjectRepository(PriceIndexProvider)
    private repository: Repository<PriceIndexProvider>,
  ) {}

  async findMany(options: FindManyOptions<PriceIndexProvider>) {
    const [data, totalRecords] = await this.repository.findAndCount(options);
    return { data, totalRecords, timestamp: new Date().toISOString() };
  }

  async findOne(id: string): Promise<PriceIndexProvider | null> {
    return this.repository.findOne({ where: { id } });
  }
}
