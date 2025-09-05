import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class BlockCheckpoint {
  @Column()
  Id: number;

  @PrimaryColumn()
  ChannelId: string;

  @CreateDateColumn()
  Created: Date;

  @UpdateDateColumn()
  Updated: Date;
}
