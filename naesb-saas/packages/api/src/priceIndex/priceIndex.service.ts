import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { PriceIndex } from '../db/priceIndex.entity';
import { PriceIndexProvider } from '../db/priceIndexProvider.entity';
import { PRICE_INDEX_PROVIDER_DATA } from '../data';
import { PRICE_INDEX_DATA } from '../data/priceIndex';

@Injectable()
export class PriceIndexService {
  constructor(
    @InjectRepository(PriceIndex)
    private priceIndexRepository: Repository<PriceIndex>,
    @InjectRepository(PriceIndexProvider)
    private priceIndexProviderRepository: Repository<PriceIndexProvider>,
  ) {
    this.init();
  }

  private async init() {
    await this.priceIndexProviderRepository.save(PRICE_INDEX_PROVIDER_DATA);
    await this.priceIndexRepository.save(PRICE_INDEX_DATA);
  }

  async findMany(options: FindManyOptions<PriceIndex>) {
    const [data, totalRecords] = await this.priceIndexRepository.findAndCount(
      options,
    );
    return { data, totalRecords, timestamp: new Date().toISOString() };
  }

  async findOne(id: string): Promise<PriceIndex | null> {
    return this.priceIndexRepository.findOne({ where: { id } });
  }
}
