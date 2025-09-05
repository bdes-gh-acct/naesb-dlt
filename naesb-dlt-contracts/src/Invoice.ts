import { Object, Property } from 'fabric-contract-api';

@Object()
export class Invoice {
  @Property()
  public InvoiceId!: string;

  @Property()
  public Name!: string;

  @Property()
  public Comments?: string;

  @Property()
  public InvoicePeriodEnd!: number;

  @Property()
  public InvoicePeriodStart!: string;

  @Property()
  Revision!: number;
}
