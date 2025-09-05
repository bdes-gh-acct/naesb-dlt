import { Object, Property } from 'fabric-contract-api';
import {
  ChangeTypeStatusCode,
  Commodity,
  ITrade,
  PerformanceTypeCode,
  PriceTypeCode,
} from './model';

@Object()
export class Trade implements ITrade {
  @Property()
  DealId!: string;

  @Property()
  Commodity!: Commodity;

  @Property()
  BaseContractRevision?: number;

  @Property()
  BuyerDealId?: string;

  @Property()
  SellerDealId?: string;

  @Property()
  InitiatingParty!: string;

  @Property()
  BuyerTrader!: string;

  @Property()
  SellerTrader!: string;

  @Property()
  BuyerParty!: string;

  @Property()
  SellerParty!: string;

  @Property()
  Price?: number;

  @Property()
  DeliveryPeriodStart!: string;

  @Property()
  DeliveryPeriodEnd!: string;

  @Property()
  DeliveryLocation!: string;

  @Property()
  Status!: ChangeTypeStatusCode;

  @Property()
  Reviewing?: string;

  @Property()
  FFQty?: number;

  @Property()
  FVMaxQty?: number;

  @Property()
  FVMinQty?: number;

  @Property()
  PriceIndex?: string;

  @Property()
  PriceIndexDifferential?: number;

  @Property()
  ITMaxQty?: number;

  @Property()
  PerformanceType!: PerformanceTypeCode;

  @Property()
  PriceType!: PriceTypeCode;

  @Property()
  Revision!: number;

  @Property()
  CreatedBy!: string;

  @Property()
  UpdatedBy!: string;

  @Property()
  Facilities?: string;

  @Property()
  Certified!: boolean;
}
