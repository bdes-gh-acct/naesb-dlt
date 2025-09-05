export const DELIVERY = 'Delivery';
export const ALLOCATION = 'DeliveryAllocation';

export enum PerformanceTypeCode {
  FIRM_FIXED = 'FF',
  FIRM_VARIABLE = 'FV',
  INTERRUPTIBLE = 'IT',
}

export enum ChangeTypeStatusCode {
  ACCEPT = 'A',
  INITIATE = 'I',
  REVISE = 'R',
  DISPUTE = 'D',
  VOID = 'V',
}

export enum PriceTypeCode {
  FIXED = 'P',
  INDEX = 'I',
}

export enum Commodity {
  NATURAL_GAS = 'NG',
}

export interface IPriceType {
  Code: PriceTypeCode;
  DisplayName: string;
}

export interface IChangeTypeStatus {
  Code: ChangeTypeStatusCode;
  DisplayName: string;
  Color: string;
}

export interface IPerformanceType {
  Code: PerformanceTypeCode;
  DisplayName: string;
}

export const PriceTypes: Array<IPriceType> = [
  { Code: PriceTypeCode.FIXED, DisplayName: 'Fixed' },
  { Code: PriceTypeCode.INDEX, DisplayName: 'Index' },
];

export const PerformanceTypes: Array<IPerformanceType> = [
  { Code: PerformanceTypeCode.FIRM_FIXED, DisplayName: 'Firm Fixed' },
  { Code: PerformanceTypeCode.FIRM_VARIABLE, DisplayName: 'Firm Variable' },
  { Code: PerformanceTypeCode.INTERRUPTIBLE, DisplayName: 'Interruptible' },
];

export const ChangeTypeStatuses: Array<IChangeTypeStatus> = [
  {
    Code: ChangeTypeStatusCode.ACCEPT,
    DisplayName: 'Accepted',
    Color: 'success',
  },
  {
    Code: ChangeTypeStatusCode.INITIATE,
    DisplayName: 'Initiated',
    Color: 'warning',
  },
  {
    Code: ChangeTypeStatusCode.REVISE,
    DisplayName: 'Revised',
    Color: 'error',
  },
  {
    Code: ChangeTypeStatusCode.DISPUTE,
    DisplayName: 'Disputed',
    Color: 'error',
  },
  {
    Code: ChangeTypeStatusCode.VOID,
    DisplayName: 'Void',
    Color: 'error',
  },
];

export interface ITrade {
  BaseContractRevision?: number;
  Certified: boolean;
  Commodity: Commodity;
  BuyerParty?: string;
  BuyerTrader?: string;
  DealId: string;
  DeliveryPeriodEnd: string;
  DeliveryPeriodStart: string;
  FFQty?: number;
  FVMaxQty?: number;
  InitiatingParty?: string;
  Facilities?: string;
  ITMaxQty?: number;
  PerformanceType: PerformanceTypeCode;
  Price?: number;
  PriceIndex?: string;
  PriceIndexDifferential?: number;
  PriceType: PriceTypeCode;
  Reviewing?: string;
  Revision: number;
  SellerParty?: string;
  SellerTrader: string;
  Status: ChangeTypeStatusCode;
}

export interface ICreateTradeRequest {
  DealId: string;
  BuyerTrader: string;
  SellerTrader: string;
  Price: number;
  QtyDay: number;
  DeliveryPeriodStart: string;
  DeliveryPeriodEnd: string;
  DeliveryLocation: string;
}

export enum ContractPerformanceObligationType {
  COVER = 'C',
  SPOT_PRICE = 'S',
}

export enum ContractPaymentType {
  WIRE_TRANSFER = 'WT',
  ACH = 'ACH',
  CHECK = 'CH',
}

export enum SpotPricePublication {
  GAS_DAILY = 'GD',
  ARGUS = 'ARG',
  OTHER = 'O',
}

export enum ContractPaymentDateType {
  DAY_OF_MONTH = 'D',
  DAYS_AFTER_FLOW = 'A',
}

export enum ContractTaxPaymentDueBy {
  BUYER = 'B',
  SELLER = 'S',
}
