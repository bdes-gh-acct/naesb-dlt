import { Property, Object } from 'fabric-contract-api';

@Object()
export class KeyHistory<TData> {
  @Property()
  public TxId!: string;

  @Property()
  public Timestamp!: string;

  @Property()
  public IsDelete!: string;
}
