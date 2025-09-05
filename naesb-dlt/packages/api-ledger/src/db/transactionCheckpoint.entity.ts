import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class TransactionCheckpoint {
  @Column()
  TransactionId: string;

  @PrimaryColumn()
  BlockId: number;

  @PrimaryColumn()
  ChannelId: string;

  @CreateDateColumn()
  Created: Date;

  @UpdateDateColumn()
  Updated: Date;
}
