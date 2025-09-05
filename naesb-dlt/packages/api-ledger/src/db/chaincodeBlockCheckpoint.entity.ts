import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class ChaincodeBlockCheckpoint {
  @PrimaryColumn()
  ChaincodeId: string;

  @Column()
  BlockId: number;

  @PrimaryColumn()
  ChannelId: string;

  @CreateDateColumn()
  Created: Date;

  @UpdateDateColumn()
  Updated: Date;
}
