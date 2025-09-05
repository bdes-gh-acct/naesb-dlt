import { ITrade } from '@naesb/dlt-model';
import { Entity, PrimaryColumn, JoinColumn, ManyToOne, Column } from 'typeorm';
import { Trade } from './trade.entity';
import { ChannelFacility } from './facility.entity';

@Entity()
export class TradeFacility {
  @PrimaryColumn()
  DealId: string;

  @PrimaryColumn()
  FacilityId: string;

  @Column()
  ChannelId: string;

  @ManyToOne(() => Trade, (trade) => trade.Facilities)
  @JoinColumn({ name: 'DealId' })
  Trade?: ITrade;

  @ManyToOne(() => ChannelFacility, (trade) => trade.Trades)
  @JoinColumn([
    { name: 'FacilityId', referencedColumnName: 'FacilityId' },
    { name: 'ChannelId', referencedColumnName: 'ChannelId' },
  ])
  Facility?: ChannelFacility;
}
