import { IWell } from '@shared/model';
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import Organization from './organization.entity';

@Entity()
class Well implements IWell {
  @PrimaryColumn()
  id!: string;

  @Column()
  businessId!: string;

  @Column()
  name!: string;

  @Column({ nullable: true })
  createdBy!: string;

  @CreateDateColumn()
  created?: Date;

  @Column({ nullable: true })
  fieldId?: string;

  @UpdateDateColumn()
  updated?: Date;

  @Column({ nullable: true })
  updatedBy!: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'businessId' })
  organization?: Organization;
}

export default Well;
