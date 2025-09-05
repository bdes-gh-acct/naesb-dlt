import {
  ChangeTypeStatusCode,
  Commodity,
  IDeliveryAllocation,
  ITradeViewModel,
  PerformanceTypeCode,
  PriceTypeCode,
} from '@naesb/dlt-model';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { DeliveryAllocation } from './deliveryAllocation.entity';
import { ColumnNumericTransformer } from './transformer';
import { TradeFacility } from './tradeFacility.entity';

@Entity()
export class Trade implements ITradeViewModel {
  @PrimaryColumn()
  DealId: string;

  @Column({
    nullable: true,
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
  })
  FFQty?: number;

  @Column()
  ChannelId: string;

  @Column()
  Commodity: Commodity;

  @Column()
  BaseContractRevision: number;

  @Column({
    nullable: true,
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
  })
  FVMaxQty?: number;

  @Column({
    nullable: true,
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
  })
  FVMinQty?: number;

  @Column()
  DeliveryPeriodEnd: string;

  @Column()
  Certified: boolean;

  @Column()
  DeliveryPeriodStart: string;

  @Column({
    type: 'decimal',
    scale: 5,
    transformer: new ColumnNumericTransformer(),
    nullable: true,
  })
  Price?: number;

  @Column({ nullable: true })
  PriceIndex?: string;

  @Column({
    nullable: true,
    type: 'decimal',
    scale: 5,
    transformer: new ColumnNumericTransformer(),
  })
  PriceIndexDifferential?: number;

  @Column({ nullable: true })
  BuyerTrader?: string;

  @Column({ nullable: true })
  SellerTrader?: string;

  @Column({
    nullable: true,
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
  })
  ITMaxQty?: number;

  @Column({
    nullable: true,
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
  })
  MaxDailyQuantity?: number;

  @Column({
    nullable: true,
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
  })
  MinDailyQuantity?: number;

  @Column({
    nullable: true,
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
  })
  MaxTotalQuantity?: number;

  @Column({
    nullable: true,
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
  })
  MinTotalQuantity?: number;

  @Column()
  PerformanceType: PerformanceTypeCode;

  @Column()
  PriceType: PriceTypeCode;

  @Column({ type: String, nullable: true })
  Reviewing!: string | null;

  @Column()
  Status: ChangeTypeStatusCode;

  @Column()
  InitiatingParty?: string;

  @Column()
  Type: string;

  @Column({ nullable: true })
  BuyerDealId?: string;

  @Column({ nullable: true })
  OrgDealId?: string;

  @Column({ nullable: true })
  CounterpartyDealId?: string;

  @Column({ nullable: true })
  SellerDealId?: string;

  @Column()
  CounterpartyId!: string;

  @Column()
  BuyerParty: string;

  @Column()
  SellerParty: string;

  @Column()
  DeliveryLocation: string;

  @Column()
  Revision: number;

  @Column()
  Duration: number;

  @OneToMany(() => DeliveryAllocation, (allocation) => allocation.Trade)
  public Allocations?: Array<IDeliveryAllocation>;

  @OneToMany(() => TradeFacility, (facility) => facility.Trade)
  public Facilities?: Array<TradeFacility>;
}
