import {
  ILocationTypeIndicator,
  LocationTypeIndicatorCode,
} from '@shared/model';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class LocationTypeIndicator implements ILocationTypeIndicator {
  @PrimaryColumn()
  code!: LocationTypeIndicatorCode;

  @Column()
  description!: string;

  @Column()
  abbreviation!: string;
}
