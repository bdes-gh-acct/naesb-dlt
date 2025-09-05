import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { TradeFacility } from './tradeFacility.entity';

@Entity()
export class ChannelFacility {
  @PrimaryColumn()
  FacilityId: string;

  @PrimaryColumn()
  ChannelId: string;

  @Column()
  public Name!: string;

  @Column()
  public Type!: string;

  @Column()
  public Owner!: string;

  @Column()
  public ReceiptLocationId!: string;

  @OneToMany(() => TradeFacility, (facility) => facility.Facility)
  public Trades?: Array<TradeFacility>;
}
