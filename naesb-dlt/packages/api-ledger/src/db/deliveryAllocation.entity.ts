import {
  IDeliveryAllocation,
  IDelivery,
  ITradeViewModel,
} from '@naesb/dlt-model';
import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Delivery } from './delivery.entity';
import { InvoiceDetail } from './invoiceDetail.entity';
import { Trade } from './trade.entity';
import { ColumnNumericTransformer } from './transformer';

@Entity()
export class DeliveryAllocation implements IDeliveryAllocation {
  @PrimaryColumn()
  AllocationId: string;

  @Column()
  DeliveryId: string;

  @Column({ type: 'decimal', transformer: new ColumnNumericTransformer() })
  Quantity: number;

  @Column()
  DealId: string;

  @Column()
  ChannelId: string;

  @ManyToOne(() => Delivery, (delivery) => delivery.Allocations)
  @JoinColumn({ name: 'DeliveryId' })
  Delivery?: IDelivery;

  @ManyToOne(() => Trade, (trade) => trade.Allocations)
  @JoinColumn({ name: 'DealId' })
  Trade?: ITradeViewModel;

  @OneToMany(() => InvoiceDetail, (detail) => detail.Allocation)
  Details?: ITradeViewModel;
}
