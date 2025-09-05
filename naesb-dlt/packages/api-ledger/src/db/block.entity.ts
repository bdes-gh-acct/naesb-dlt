import { IBlock } from '@naesb/dlt-model';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { Transaction } from './transaction.entity';

@Entity()
export class Block implements IBlock {
  @PrimaryColumn()
  hash: string;

  @Column()
  block_number: number;

  @Column()
  previous_hash: string;

  @Column()
  transactionCount: number;

  @OneToMany(() => Transaction, (tx) => tx.block)
  transactions: Transaction[];
}
