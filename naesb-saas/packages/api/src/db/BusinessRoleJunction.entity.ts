/* eslint-disable import/no-cycle */
import {
  Entity,
  PrimaryColumn,
  JoinColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import Organization from './organization.entity';
import { BusinessRole } from './BusinessRole.entity';

@Entity()
export class BusinessRoleJunction {
  @PrimaryColumn()
  businessId!: string;

  @PrimaryColumn()
  businessRoleId!: number;

  @CreateDateColumn()
  created?: Date;

  @UpdateDateColumn()
  updated?: Date;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'businessId' })
  organization?: Organization;

  @ManyToOne(() => BusinessRole)
  @JoinColumn({ name: 'businessRoleId' })
  role?: BusinessRole;
}
