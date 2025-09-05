import { IDid } from '@naesb/aries-types';
import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import Did from './did.entity';

@Entity()
class AgentConnection {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: true })
  label?: string;

  @Column({ nullable: true })
  alias?: string;

  @Column()
  state!: string;

  @ManyToOne(() => Did)
  @JoinColumn({ name: 'their_did' })
  connected_did?: IDid;
}

export default AgentConnection;
