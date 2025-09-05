import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryResultDto } from '@shared/server-utils';
import { Invoice } from 'src/db/invoice.entity';
import { FindManyOptions, FindOneOptions, Repository } from 'typeorm';

@Injectable()
export class InvoiceService {
  constructor(
    @InjectRepository(Invoice)
    private repository: Repository<Invoice>,
  ) {}

  async findMany(
    options: FindManyOptions<Invoice>,
  ): Promise<QueryResultDto<Invoice>> {
    const [data, totalRecords] = await this.repository.findAndCount(options);
    return new QueryResultDto<Invoice>({ data, totalRecords });
  }

  async findOne(
    id: string,
    options?: FindOneOptions<Invoice>,
  ): Promise<Invoice | null> {
    return this.repository.findOne({ where: { InvoiceId: id }, ...options });
  }
}
