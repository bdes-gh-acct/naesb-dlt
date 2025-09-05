/* eslint-disable no-await-in-loop */
import * as dotenv from 'dotenv';
import { Injectable } from '@nestjs/common';
import { IndyTransaction, LedgerType } from '@naesb/aries-types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { maxBy } from 'lodash';
import { LedgerService } from './ledger.service';
import { Pointer } from '../db';
import { TransactionService } from './transaction.service';
import { DidService } from './did.service';
import { SchemaService } from './schema.service';
import { CredentialDefinitionService } from './credentialDefinition.service';

dotenv.config();

@Injectable()
export class SyncService {
  constructor(
    private readonly ledgerService: LedgerService,
    @InjectRepository(Pointer)
    private readonly pointerRepository: Repository<Pointer>,
    private readonly transactionService: TransactionService,
    private readonly didService: DidService,
    private readonly schemaService: SchemaService,
    private readonly credentialDefinitionService: CredentialDefinitionService,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.runWithInterval();
  }

  async getNextTransaction(
    seq: number,
    ledger: LedgerType,
    transactions: Array<IndyTransaction>,
  ) {
    console.debug(`Syncing Ledger: ${ledger} -- Fetching seqNo ${seq}`);
    const row = await this.ledgerService.getLedgerTransaction(seq, ledger);
    if (row && row.success && row.value) {
      console.debug(`Syncing Ledger: ${ledger} -- seqNo ${seq} found`);
      transactions.push(row.value);
      await this.getNextTransaction(seq + 1, ledger, transactions);
    } else {
      console.debug(
        `Syncing Ledger: ${ledger} -- done syncing ledger -- seqNo: ${seq - 1}`,
      );
    }

    return transactions;
  }

  async sync(ledger: LedgerType) {
    const latest = await this.getLatest(ledger);
    const transactions = await this.getNextTransaction(latest + 1, ledger, []);
    const seq = transactions.length
      ? maxBy(transactions, (txn) => txn.txnMetadata.seqNo)?.txnMetadata
          .seqNo || 0
      : latest || 0;
    await this.transactionService.saveTransactions(ledger, transactions);
    await this.didService.saveDids(transactions);
    await this.schemaService.saveSchemas(transactions);
    await this.credentialDefinitionService.save(transactions);
    if (seq > latest) {
      await this.setLatest(ledger, seq);
    }
  }

  async getLatest(ledger: LedgerType) {
    const pointer = await this.pointerRepository.findOne({
      where: { ledger: ledger.valueOf() },
    });
    return pointer ? pointer.sequence : 0;
  }

  async setLatest(ledger: LedgerType, sequence: number) {
    const record = this.pointerRepository.create({
      ledger: ledger.valueOf(),
      sequence,
    });
    return this.pointerRepository.save(record);
  }

  async runWithInterval() {
    await this.pointerRepository.clear();
    const interval = Number(process.env.LEDGER_SYNC_INTERVAL) || 60 * 1000;
    await this.sync(LedgerType.DOMAIN);
    const doWork = async () => {
      await Promise.all([
        this.sync(LedgerType.DOMAIN),
        new Promise<void>((resolve) => {
          setTimeout(() => {
            resolve();
          }, interval);
        }),
      ]);
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      // eslint-disable-next-line no-void
      void doWork();
    };
    setTimeout(() => {
      // eslint-disable-next-line no-void
      void doWork();
    }, interval);
  }
}
