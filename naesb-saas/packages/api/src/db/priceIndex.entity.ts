/* eslint-disable import/no-cycle */
import { IPriceIndex } from '@shared/model';
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PriceIndexProvider } from './priceIndexProvider.entity';

@Entity()
export class PriceIndex implements IPriceIndex {
  @PrimaryColumn()
  id!: string;

  @Column()
  providerId!: string;

  @Column()
  name!: string;

  @ManyToOne(() => PriceIndexProvider, (provider) => provider.indices)
  @JoinColumn({ name: 'providerId' })
  provider?: PriceIndexProvider;
}
