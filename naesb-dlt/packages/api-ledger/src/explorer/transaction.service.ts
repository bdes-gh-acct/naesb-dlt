import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryResultDto } from '@shared/server-utils';
import { FindManyOptions, Repository } from 'typeorm';
import { Transaction } from '../db/transaction.entity';

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async findMany(
    options: FindManyOptions<Transaction>,
  ): Promise<QueryResultDto<Transaction>> {
    const [data, totalRecords] = await this.transactionRepository.findAndCount(
      options,
    );
    return new QueryResultDto<Transaction>({ data, totalRecords });
  }

  async findOne(id: string): Promise<Transaction | null> {
    return this.transactionRepository.findOne({ where: { id } });
  }
}
