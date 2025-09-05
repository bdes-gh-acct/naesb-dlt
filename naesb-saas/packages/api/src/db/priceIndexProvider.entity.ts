/* eslint-disable import/no-cycle */
import { IPriceIndex, IPriceIndexProvider } from '@shared/model';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { PriceIndex } from './priceIndex.entity';

@Entity()
export class PriceIndexProvider implements IPriceIndexProvider {
  @PrimaryColumn()
  id!: string;

  @Column()
  name!: string;

  @Column()
  abbreviation!: string;

  @OneToMany(() => PriceIndex, (location) => location.provider)
  indices?: Array<IPriceIndex>;
}
