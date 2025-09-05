import { IUserOrganization } from '@shared/model';
import { Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import Organization from './organization.entity';

@Entity({ name: 'USER_ORGANIZATION' })
class UserOrganization implements IUserOrganization {
  @PrimaryColumn()
  userId!: string;

  @PrimaryColumn()
  businessId!: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'businessId' })
  organization?: Organization;
}

export default UserOrganization;
