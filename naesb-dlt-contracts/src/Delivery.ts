import { Object, Property } from 'fabric-contract-api';
import { Commodity } from './model';

@Object()
export class Delivery {
  @Property()
  public DeliveryId!: string;

  @Property()
  public Date!: string;

  @Property()
  public Commodity!: Commodity;

  @Property()
  public ServiceRequestorParty!: string;

  @Property()
  public ReceivingParty!: string;

  @Property()
  public TspBusinessId!: number;

  @Property()
  public DeliveryLocation!: string;

  @Property()
  public ActualQuantity?: number;

  @Property()
  public TspDeliveryId?: string;

  @Property()
  public ScheduledQuantity?: number;

  @Property()
  public NominatedQuantity?: number;

  @Property()
  public Revision!: number;
}

@Object()
export class QueryResult {
  @Property()
  public fetchedRecords!: number;

  @Property()
  public data!: string;

  @Property()
  public bookmark?: string;
}
