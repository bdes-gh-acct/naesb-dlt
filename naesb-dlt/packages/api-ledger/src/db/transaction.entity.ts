import { ITransaction } from '@naesb/dlt-model';
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Block } from './block.entity';

@Entity()
export class Transaction implements ITransaction {
  @PrimaryColumn()
  id: string;

  @Column()
  block_hash: string;

  @Column()
  block_number: number;

  @Column()
  type?: number;

  @PrimaryColumn()
  channel_id: string;

  @Column({ nullable: true })
  signer: string;

  @Column({ nullable: true })
  signer_role: string;

  @Column({ nullable: true })
  mspId: string;

  @Column()
  timestamp: Date;

  @Column({ type: 'simple-json', nullable: true })
  data: any;

  @Column({ nullable: true })
  payload: string;

  @ManyToOne(() => Block, (block) => block.transactions, {
    createForeignKeyConstraints: false,
  })
  @JoinColumn({ name: 'block_hash' })
  block: Block;
}
