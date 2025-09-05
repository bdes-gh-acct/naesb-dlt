import {
  BusinessStatus,
  CompanyType,
  IOrganization,
  TaxNumberType,
} from '@shared/model';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { BusinessRoleJunction } from './BusinessRoleJunction.entity';

@Entity({ name: 'ORGANIZATION' })
class Organization implements IOrganization {
  @Column()
  name!: string;

  @Column()
  address?: string;

  @Column({ nullable: true })
  endpoint?: string;

  @Column({ nullable: true })
  internalId?: string;

  @Column({ nullable: true })
  fercCid?: string;

  @Column({ nullable: true })
  website?: string;

  @Column()
  taxNumber!: string;

  @Column()
  taxNumberType!: TaxNumberType;

  @Column({ nullable: true })
  jurisdiction?: string;

  @Column()
  companyType!: CompanyType;

  @Column({ nullable: true })
  otherCompanyType?: string;

  @Column()
  businessStatus!: BusinessStatus;

  @PrimaryColumn()
  businessId!: string;

  @CreateDateColumn()
  created?: Date;

  @UpdateDateColumn()
  updated?: Date;

  @Column({
    nullable: true,
  })
  did?: string;

  @Column({
    nullable: true,
  })
  verKey?: string;

  @OneToMany(() => BusinessRoleJunction, (role) => role.organization)
  roles?: Array<BusinessRoleJunction>;
}

export default Organization;
