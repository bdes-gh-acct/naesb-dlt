import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { ICredentialDefinition, IDid } from '@naesb/aries-types';
import Did from './did.entity';
import Schema from './schema.entity';

@Entity()
class CredentialDefinition implements ICredentialDefinition {
  @Column()
  id!: string;

  @PrimaryColumn()
  seqNo!: number;

  @Column()
  createdBy!: string;

  @Column()
  schemaSeqNo!: number;

  @Column({ nullable: true })
  tag?: string;

  @Column({ nullable: true })
  signatureType?: string;

  @ManyToOne(() => Did)
  @JoinColumn({ name: 'createdBy' })
  did?: IDid;

  @ManyToOne(() => Schema)
  @JoinColumn({ name: 'schemaSeqNo', referencedColumnName: 'seqNo' })
  schema?: Schema;

  @Column({ nullable: true })
  created?: Date;
}

export default CredentialDefinition;
