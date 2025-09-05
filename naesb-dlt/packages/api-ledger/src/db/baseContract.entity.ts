import {
  ChangeTypeStatusCode,
  Commodity,
  IBaseContract,
  INaturalGasCommodityDetails,
} from '@naesb/dlt-model';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class BaseContract implements IBaseContract {
  @Column()
  public Revision!: number;

  @PrimaryColumn()
  public Commodity!: Commodity;

  @PrimaryColumn()
  public ChannelId!: string;

  @Column({ nullable: true })
  public TextHash?: string;

  @Column({ nullable: true })
  public Reviewing?: string;

  @Column()
  public Status!: ChangeTypeStatusCode;

  @Column()
  public InitiatingParty!: string;

  @Column()
  public ReceivingParty!: string;

  @Column({ type: 'simple-json' })
  public CommodityDetail!: INaturalGasCommodityDetails;

  @Column({ type: 'simple-json', nullable: true })
  public Approved!: any;

  @ManyToOne(() => Channel, (channel) => channel.Members)
  @JoinColumn({ name: 'ChannelId' })
  Channel?: Channel;
}
