import { Entity, PrimaryColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity()
class Pointer {
  @PrimaryColumn()
  ledger!: number;

  @Column()
  sequence!: number;

  @UpdateDateColumn()
  updated?: Date;
}

export default Pointer;
