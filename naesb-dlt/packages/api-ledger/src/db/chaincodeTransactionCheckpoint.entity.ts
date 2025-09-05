import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ChaincodeTransactionCheckpoint {
  @Column()
  TransactionId: string;

  @PrimaryColumn()
  BlockId: number;

  @PrimaryColumn()
  ChannelId: string;

  @PrimaryColumn()
  ChaincodeId: string;

  @CreateDateColumn()
  Created: Date;

  @UpdateDateColumn()
  Updated: Date;
}
