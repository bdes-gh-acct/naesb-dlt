import {
  Entity,
  PrimaryColumn,
  Column,
  BeforeInsert,
  CreateDateColumn,
} from 'typeorm';
import {
  TransactionType,
  IndyTransaction,
  IndyRoleType,
  ITransaction,
} from '@naesb/aries-types';
import { mapTransactionTypeToName, mapRoleTypeToName } from '../util';

@Entity()
class Transaction implements ITransaction {
  @BeforeInsert()
  mapTransactionType() {
    this.transactionTypeName = mapTransactionTypeToName(this.transactionType);
  }

  @BeforeInsert()
  mapRoleType() {
    this.roleName = mapRoleTypeToName(this.role);
  }

  @CreateDateColumn()
  created!: Date;

  @PrimaryColumn('int')
  seqNo!: number;

  @Column({ nullable: true })
  transactionType?: TransactionType;

  @Column({ nullable: true })
  transactionTypeName?: string;

  @Column({ nullable: true })
  role?: IndyRoleType;

  @Column({ nullable: true })
  roleName?: string;

  @Column({ nullable: true })
  transactionId?: string;

  @Column('simple-json')
  value?: IndyTransaction;

  @Column({ nullable: true })
  createdBy?: string;

  @Column({ nullable: true })
  destination?: string;
}

export default Transaction;
