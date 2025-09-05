/* eslint-disable import/no-cycle */
import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class BusinessRole {
  @PrimaryColumn()
  id!: number;

  @Column()
  Name!: string;

  @CreateDateColumn()
  created?: Date;

  @UpdateDateColumn()
  updated?: Date;
}
