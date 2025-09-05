import { Entity, PrimaryColumn, ManyToOne, JoinColumn, Column } from 'typeorm';
import AgentConnection from './connection.entity';
import CredentialDefinition from './credentialDefinition.entity';
import Schema from './schema.entity';

@Entity()
class CertificateProof {
  @Column()
  presentationExchangeId!: string;

  @PrimaryColumn()
  id!: string;

  @Column()
  connectionId!: string;

  @Column()
  credentialDefinitionId!: string;

  @Column()
  schemaId!: string;

  @Column({ nullable: true })
  target_name?: string;

  @Column({ nullable: true })
  target_type?: string;

  @Column({ nullable: true })
  target_id?: string;

  @Column({ nullable: true })
  issued_to?: string;

  @Column({ nullable: true })
  expiration?: Date;

  @Column({ nullable: true })
  effective?: Date;

  @Column({ nullable: true })
  rating?: string;

  @Column({ nullable: true })
  score?: number;

  @ManyToOne(() => AgentConnection, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'connectionId' })
  connection?: AgentConnection;

  @ManyToOne(() => CredentialDefinition, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'credentialDefinitionId', referencedColumnName: 'id' })
  credentialDefinition?: CredentialDefinition;

  @ManyToOne(() => Schema, { createForeignKeyConstraints: false })
  @JoinColumn({ name: 'schemaId' })
  schema?: Schema;
}

export default CertificateProof;
