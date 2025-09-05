import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { ChannelStatus, IChannel } from '@naesb/dlt-model';
import { ChannelMember } from './channelMember.entity';
import { BaseContract } from './baseContract.entity';

@Entity()
export class Channel implements IChannel {
  @PrimaryColumn()
  ChannelId: string;

  @Column({ nullable: true })
  Name?: string;

  @Column({ nullable: true })
  CounterpartyId?: string;

  @Column({ nullable: true })
  CounterpartyEndpoint?: string;

  @Column({ nullable: true })
  NetworkStatus?: string;

  @Column({ nullable: true })
  Status?: ChannelStatus;

  @OneToMany(() => ChannelMember, (member) => member.Channel)
  Members?: ChannelMember[];

  @OneToMany(() => BaseContract, (member) => member.Channel)
  Contracts?: BaseContract[];
}
