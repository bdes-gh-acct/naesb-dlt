/* eslint-disable no-await-in-loop */
import * as dotenv from 'dotenv';
import { Injectable } from '@nestjs/common';
import {
  CredentialDefinitionTransaction,
  IndyTransaction,
  TransactionType,
} from '@naesb/aries-types';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { CredentialDefinition } from '../db';

dotenv.config();

@Injectable()
export class CredentialDefinitionService {
  constructor(
    @InjectRepository(CredentialDefinition)
    private readonly credentialDefinitionRepository: Repository<CredentialDefinition>,
  ) {}

  async save(indyTransactions: Array<IndyTransaction>) {
    const transactions = indyTransactions.filter(
      (transaction) => transaction.txn.type === TransactionType.CRED_DEF,
    );
    const credDefs = transactions.map((transaction): CredentialDefinition => {
      const created = transaction.txnMetadata.txnTime;
      const txn = transaction.txn as CredentialDefinitionTransaction;
      return {
        id: transaction.txnMetadata.txnId as string,
        seqNo: transaction.txnMetadata.seqNo,
        createdBy: txn.metadata.from,
        schemaSeqNo: txn.data.ref,
        tag: txn.data.tag,
        signatureType: txn.data.signature_type,
        created: created ? new Date(created) : undefined,
      };
    });
    const items = this.credentialDefinitionRepository.create(credDefs);
    await this.credentialDefinitionRepository.save(items);
  }

  async findMany(options?: FindManyOptions<CredentialDefinition>) {
    const [data, totalRecords] =
      await this.credentialDefinitionRepository.findAndCount(options);
    return { data, totalRecords };
  }
}
