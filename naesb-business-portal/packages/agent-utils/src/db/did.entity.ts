import { Entity, PrimaryColumn, Column, OneToMany } from 'typeorm';
import { IndyRoleType, IDid, ISchema } from '@naesb/aries-types';
import Schema from './schema.entity';

@Entity()
class Did implements IDid {
  @PrimaryColumn()
  id!: string;

  @Column({ nullable: true })
  createdBy!: string;

  @Column({ nullable: true })
  seqNo!: number;

  @Column({ nullable: true })
  role?: IndyRoleType;

  @Column({ nullable: true })
  alias?: string;

  @Column()
  verkey?: string;

  @Column({ nullable: true })
  roleName?: string;

  @Column({ type: 'simple-json', nullable: true })
  attributes?: any;

  @OneToMany(() => Schema, (schema) => schema.did)
  schemas?: ISchema;
}

export default Did;
