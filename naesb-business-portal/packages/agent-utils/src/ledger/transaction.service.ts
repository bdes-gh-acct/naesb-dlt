/* eslint-disable no-await-in-loop */
import * as dotenv from 'dotenv';
import { Injectable } from '@nestjs/common';
import { IndyTransaction, LedgerType } from '@naesb/aries-types';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Transaction } from '../db';
import { transformLedgerTransactionToDbModel } from '../util/transaction';

dotenv.config();

@Injectable()
export class TransactionService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepository: Repository<Transaction>,
  ) {}

  async saveTransactions(
    ledger: LedgerType,
    indyTransactions: Array<IndyTransaction>,
  ) {
    const transactions = this.transactionRepository.create(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      indyTransactions.map((txn) =>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        transformLedgerTransactionToDbModel(ledger, txn),
      ),
    );
    return this.transactionRepository.save(transactions);
  }

  async findMany(options?: FindManyOptions<Transaction>) {
    const [data, totalRecords] = await this.transactionRepository.findAndCount(
      options,
    );
    return { data, totalRecords };
  }
}
