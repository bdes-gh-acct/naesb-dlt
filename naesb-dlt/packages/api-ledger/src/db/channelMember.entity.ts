import { IChannelMember } from '@naesb/dlt-model';
import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Channel } from './channel.entity';

@Entity()
export class ChannelMember implements IChannelMember {
  @PrimaryColumn()
  MemberId: string;

  @PrimaryColumn()
  ChannelId: string;

  @ManyToOne(() => Channel, (channel) => channel.Members)
  @JoinColumn({ name: 'ChannelId' })
  Channel?: Channel;
}
