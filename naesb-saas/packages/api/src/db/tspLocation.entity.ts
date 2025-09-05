import {
  LocationTypeIndicatorCode,
  LocationStatusIndicatorCode,
  DirectionOfFlowCode,
  ITspLocation,
} from '@shared/model';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DirectionOfFlow } from './directionOfFlow.entity';
import { LocationTypeIndicator } from './locationTypeIndicator.entity';
import Organization from './organization.entity';

@Entity()
class TspLocation implements ITspLocation {
  @PrimaryColumn()
  locationId!: string;

  @Column()
  businessId!: string;

  @Column()
  locationName!: string;

  @CreateDateColumn()
  createDate!: string;

  @Column()
  effectiveDate!: string;

  @Column({ nullable: true })
  locator?: string;

  @Column({ nullable: true })
  locatorIdentifier?: string;

  @Column({ nullable: true })
  inactiveDate?: string;

  @UpdateDateColumn()
  updateDate!: string;

  @Column()
  state!: string;

  @Column({ nullable: true })
  comments?: string;

  @Column()
  county!: string;

  @Column({ nullable: true })
  zone?: string;

  @Column({ nullable: true })
  typeIndicator?: LocationTypeIndicatorCode;

  @Column()
  statusIndicator!: LocationStatusIndicatorCode;

  @Column()
  directionOfFlow!: DirectionOfFlowCode;

  @Column()
  upstreamDownstreamEntityIndicator!: string;

  @Column({ nullable: true })
  upstreamDownstreamEntityName?: string;

  @Column({ nullable: true })
  upstreamDownstreamEntityLocation?: string;

  @Column({ nullable: true })
  upstreamDownstreamEntityLocationName?: string;

  @Column({ nullable: true })
  upstreamDownstreamIdentifierCode?: string;

  @Column({ nullable: true })
  upstreamDownstreamIdentifierProprietaryCode?: string;

  @Column({ nullable: true })
  upstreamDownstreamEntityFercCid?: string;

  @Column({ nullable: true })
  upstreamDownstreamEntityFercCidIndicator?: string;

  @ManyToOne(() => Organization)
  @JoinColumn({ name: 'businessId' })
  organization?: Organization;

  @ManyToOne(() => DirectionOfFlow)
  @JoinColumn({ name: 'directionOfFlow' })
  directionOfFlowCode?: DirectionOfFlow;

  @ManyToOne(() => LocationTypeIndicator)
  @JoinColumn({ name: 'typeIndicator' })
  typeIndicatorCode?: LocationTypeIndicator;
}

export default TspLocation;
