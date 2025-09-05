import {
  IDeliveryAllocation,
  IInvoice,
  IInvoiceDetail,
} from '@naesb/dlt-model';
import { Entity, Column, PrimaryColumn, JoinColumn, ManyToOne } from 'typeorm';
import { DeliveryAllocation } from './deliveryAllocation.entity';
import { Invoice } from './invoice.entity';
import { Trade } from './trade.entity';
import { ColumnNumericTransformer } from './transformer';

@Entity()
export class InvoiceDetail implements IInvoiceDetail {
  @Column()
  DealId: string;

  @PrimaryColumn()
  InvoiceId: string;

  @PrimaryColumn()
  AllocationId: string;

  @Column()
  ChannelId: string;

  @Column({
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
  })
  Price: number;

  @Column()
  Quantity: number;

  @Column()
  Date: string;

  @Column()
  Revision: number;

  @ManyToOne(() => DeliveryAllocation, (allocation) => allocation.Details)
  @JoinColumn({ name: 'AllocationId' })
  Allocation?: IDeliveryAllocation;

  @ManyToOne(() => Trade)
  @JoinColumn({ name: 'DealId' })
  Trade?: IDeliveryAllocation;

  @ManyToOne(() => Invoice, (invoice) => invoice.Details)
  @JoinColumn({ name: 'InvoiceId' })
  Invoice?: IInvoice;
}
