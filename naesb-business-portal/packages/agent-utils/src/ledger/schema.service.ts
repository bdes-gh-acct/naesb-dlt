/* eslint-disable no-await-in-loop */
import * as dotenv from 'dotenv';
import { Injectable } from '@nestjs/common';
import {
  IndyTransaction,
  ISchema,
  SchemaTransaction,
  TransactionType,
} from '@naesb/aries-types';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { Schema } from '../db';

dotenv.config();

@Injectable()
export class SchemaService {
  constructor(
    @InjectRepository(Schema)
    private readonly schemaRespository: Repository<Schema>,
  ) {}

  async saveSchemas(indyTransactions: Array<IndyTransaction>) {
    const schemaTransactions = indyTransactions.filter(
      (transaction) => transaction.txn.type === TransactionType.SCHEMA,
    );

    const schemas = schemaTransactions.map((transaction): ISchema => {
      const id = transaction.txnMetadata.txnId || '';
      const created = transaction.txnMetadata.txnTime;

      const txn = transaction.txn as SchemaTransaction;
      return {
        id,
        seqNo: transaction.txnMetadata.seqNo,
        createdBy: txn.metadata.from,
        attributes: txn.data.data.attr_names,
        name: txn.data.data.name,
        version: txn.data.data.version,
        created: created ? new Date(created) : undefined,
      };
    });
    return this.schemaRespository.save(schemas);
  }

  async findMany(options?: FindManyOptions<Schema>) {
    const [data, totalRecords] = await this.schemaRespository.findAndCount(
      options,
    );
    return { data, totalRecords };
  }
}
