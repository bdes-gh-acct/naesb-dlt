import { IPriceIndex } from '@shared/model';
import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { PriceIndex } from './priceIndex.entity';
import { ColumnNumericTransformer } from './transformer';

@Entity()
export class PriceIndexDate {
  @PrimaryColumn()
  id!: string;

  @Column()
  indexId!: string;

  @Column()
  date!: Date;

  @Column({ type: 'decimal', transformer: new ColumnNumericTransformer() })
  price!: number;

  @ManyToOne(() => PriceIndex)
  @JoinColumn({ name: 'indexId' })
  index?: IPriceIndex;
}
