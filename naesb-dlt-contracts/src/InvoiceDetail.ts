import { Object, Property } from 'fabric-contract-api';

@Object()
export class InvoiceDetail {
  @Property()
  public DealId!: string;

  @Property()
  public InvoiceId!: string;

  @Property()
  public AllocationId!: string;

  @Property()
  public Price!: number;

  @Property()
  public Quantity!: number;

  @Property()
  public Date!: string;

  @Property()
  Revision!: number;
}
