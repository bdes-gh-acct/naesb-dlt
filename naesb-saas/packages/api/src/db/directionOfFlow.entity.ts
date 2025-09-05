import { DirectionOfFlowCode, IDirectionOfFlow } from '@shared/model';
import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity()
export class DirectionOfFlow implements IDirectionOfFlow {
  @PrimaryColumn()
  code!: DirectionOfFlowCode;

  @Column()
  description!: string;

  @Column()
  abbreviation!: string;
}
