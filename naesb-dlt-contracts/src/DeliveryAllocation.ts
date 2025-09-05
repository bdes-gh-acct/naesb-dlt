import { Object, Property } from 'fabric-contract-api';

@Object()
export class DeliveryAllocation {
  @Property()
  public DeliveryId!: string;

  @Property()
  public Quantity!: number;

  @Property()
  public DealId!: string;
}
