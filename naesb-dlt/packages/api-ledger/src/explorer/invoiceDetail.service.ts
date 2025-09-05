import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryResultDto } from '@shared/server-utils';
import { InvoiceDetail } from 'src/db/invoiceDetail.entity';
import { FindManyOptions, Repository } from 'typeorm';

@Injectable()
export class InvoiceDetailService {
  constructor(
    @InjectRepository(InvoiceDetail)
    private repository: Repository<InvoiceDetail>,
  ) {}

  async findMany(
    options: FindManyOptions<InvoiceDetail>,
  ): Promise<QueryResultDto<InvoiceDetail>> {
    const [data, totalRecords] = await this.repository.findAndCount(options);
    return new QueryResultDto<InvoiceDetail>({ data, totalRecords });
  }

  async findOne(
    invoiceId: string,
    allocationId: string,
  ): Promise<InvoiceDetail | null> {
    return this.repository.findOne({
      where: { InvoiceId: invoiceId, AllocationId: allocationId },
    });
  }
}
