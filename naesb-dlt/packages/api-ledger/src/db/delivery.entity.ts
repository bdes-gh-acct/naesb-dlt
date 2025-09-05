import { IDeliveryAllocation, IDelivery, Commodity } from '@naesb/dlt-model';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { DeliveryAllocation } from './deliveryAllocation.entity';
import { ColumnNumericTransformer } from './transformer';

@Entity()
export class Delivery implements IDelivery {
  @PrimaryColumn()
  public DeliveryId: string;

  @Column({ nullable: true })
  public TspDeliveryId?: string;

  @Column()
  public Date: string;

  @Column()
  public ChannelId: string;

  @Column()
  public Commodity: Commodity;

  @Column()
  public TspBusinessId: string;

  @Column()
  public DeliveryLocation: string;

  @Column()
  public ServiceRequestorParty: string;

  @Column()
  public ReceivingParty: string;

  @Column({
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
  })
  public ActualQuantity?: number;

  @Column({
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
  })
  public NominatedQuantity?: number;

  @Column({
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
  })
  public ScheduledQuantity?: number;

  @Column()
  public Revision: number;

  @OneToMany(() => DeliveryAllocation, (allocation) => allocation.Delivery)
  public Allocations?: Array<IDeliveryAllocation>;
}
