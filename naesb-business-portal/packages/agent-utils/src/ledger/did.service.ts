/* eslint-disable no-await-in-loop */
import * as dotenv from 'dotenv';
import { Injectable } from '@nestjs/common';
import {
  AttributeTransaction,
  IndyTransaction,
  NymTransaction,
  TransactionType,
} from '@naesb/aries-types';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, In, Repository } from 'typeorm';
import { groupBy, merge, sortBy } from 'lodash';
import { Did } from '../db';
import { mapRoleTypeToName } from '../util';

dotenv.config();

@Injectable()
export class DidService {
  constructor(
    @InjectRepository(Did)
    private readonly didRepository: Repository<Did>,
  ) {}

  async saveDids(indyTransactions: Array<IndyTransaction>) {
    const nymTransactions = indyTransactions.filter(
      (transaction) => transaction.txn.type === TransactionType.NYM,
    );
    const attTransactions = indyTransactions.filter(
      (transaction) => transaction.txn.type === TransactionType.ATTRIB,
    );
    const uniqueAttDidArray = [
      ...new Set([
        ...attTransactions.map(
          (txn) => (txn.txn as AttributeTransaction).data.dest,
        ),
      ]),
    ];
    const attribDictionary = groupBy(
      sortBy(attTransactions, (txn) => txn.txnMetadata.seqNo),
      (txn) => (txn.txn as AttributeTransaction).data.dest,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const existingDids = (
      await this.didRepository.find({
        where: {
          id: In(uniqueAttDidArray),
        },
      })
    ).reduce(
      (acc: Record<string, any>, did) => ({ ...acc, [did.id]: did.attributes }),
      {},
    );

    const nyms = nymTransactions.map((transaction) => {
      const txn = transaction.txn as NymTransaction;
      return {
        alias: txn.data.alias,
        seqNo: transaction.txnMetadata.seqNo,
        id: txn.data.dest,
        roleName: mapRoleTypeToName(txn.data.role),
        verkey: txn.data.verkey,
        createdBy: txn.metadata.from,
        role: txn.data.role,
      };
    });
    const dids = this.didRepository.create(nyms);
    await this.didRepository.save(dids);
    const atts = Object.entries(attribDictionary).map(([key, value]) => ({
      id: key,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      attributes: merge(
        {},
        { ...(existingDids[key] || {}) },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        ...value.map(
          (val) =>
            JSON.parse((val.txn as AttributeTransaction).data.raw) as {
              endpoint: string;
            },
        ),
      ),
    }));
    const attributes = this.didRepository.create(atts);
    await this.didRepository.save(attributes);
  }

  async findMany(options?: FindManyOptions<Did>) {
    const [data, totalRecords] = await this.didRepository.findAndCount(options);
    return { data, totalRecords };
  }
}
