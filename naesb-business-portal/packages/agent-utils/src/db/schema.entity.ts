import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { IDid, ISchema } from '@naesb/aries-types';
import Did from './did.entity';

@Entity()
class Schema implements ISchema {
  @PrimaryColumn()
  id!: string;

  @Column({ unique: true })
  seqNo!: number;

  @Column()
  createdBy!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  version?: string;

  @Column({ type: 'simple-array' })
  attributes: Array<string> = [];

  @ManyToOne(() => Did, (did) => did.schemas)
  @JoinColumn({ name: 'createdBy' })
  did?: IDid;

  @Column({ nullable: true })
  created?: Date;
}

export default Schema;
