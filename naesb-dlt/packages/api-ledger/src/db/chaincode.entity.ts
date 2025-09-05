import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class Chaincode {
  @PrimaryColumn()
  Label: string;

  @PrimaryColumn()
  ChannelId: string;

  @Column()
  Version: string;

  @Column({ nullable: true })
  Sequence?: number;

  @Column({ nullable: true })
  Approved_Timestamp?: Date;

  @Column({ nullable: true })
  Committed_Timestamp?: Date;

  @Column({ nullable: true })
  Initiated_Timestamp?: Date;
}
