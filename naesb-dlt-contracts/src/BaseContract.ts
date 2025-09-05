import { Object, Property } from 'fabric-contract-api';
import {
  ChangeTypeStatusCode,
  Commodity,
  ContractPaymentDateType,
  ContractPaymentType,
  ContractPerformanceObligationType,
  ContractTaxPaymentDueBy,
  SpotPricePublication,
} from './model';

export const BASE_CONTRACT = 'BASE';

@Object()
export class NaturalGasCommodityDetails {
  @Property()
  public CertifiedGas!: boolean;

  @Property()
  public AutoAllocation!: boolean;

  @Property()
  public AutoAllocationPrioritizeDaily!: boolean;

  @Property()
  public ConfirmDeadlineDays?: number;

  @Property()
  public PerformanceObligationType!: ContractPerformanceObligationType;

  @Property()
  public SpotPricePublication!: SpotPricePublication;

  @Property()
  public OtherSpotPricePublication?: string;

  @Property()
  public TaxesDueBy!: ContractTaxPaymentDueBy;

  @Property()
  public PaymentDateType!: ContractPaymentDateType;

  @Property()
  public PaymentDate!: number;

  @Property()
  public PaymentType!: ContractPaymentType;

  @Property()
  public Netting!: boolean;

  @Property()
  public EarlyTerminationDamages!: boolean;

  @Property()
  public Confidentiality!: boolean;
}

@Object()
export class Base {
  @Property()
  public Revision!: number;

  @Property()
  public Commodity!: Commodity;

  @Property()
  public TextHash!: string;

  @Property()
  public Reviewing?: string;

  @Property()
  public Status!: ChangeTypeStatusCode;

  @Property()
  public InitiatingParty!: string;

  @Property()
  public ReceivingParty!: string;

  @Property()
  public CommodityDetail!: NaturalGasCommodityDetails;

  @Property()
  public Approved?: Base;
}

export interface INaturalGasCommodityDetails {
  CertifiedGas: boolean;
  AutoAllocation: boolean;
  AutoAllocationPrioritizeDaily: boolean;
  ConfirmDeadlineDays?: number;
  PerformanceObligationType: ContractPerformanceObligationType;
  SpotPricePublication: SpotPricePublication;
  OtherSpotPricePublication: string;
  TaxesDueBy: ContractTaxPaymentDueBy;
  PaymentDateType: ContractPaymentDateType;
  PaymentDate: number;
  PaymentType: ContractPaymentType;
  Netting: boolean;
  EarlyTerminationDamages: boolean;
  Confidentiality: boolean;
}
