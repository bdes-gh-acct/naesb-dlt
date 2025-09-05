import { Commodity } from './commodity';

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
    Color: 'primary',
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
    Color: 'inherit',
  },
];

export interface ITrade {
  BuyerDealId?: string;
  Commodity: Commodity;
  BaseContractRevision: number;
  BuyerParty: string;
  Certified: boolean;
  BuyerTrader?: string;
  DealId: string;
  DeliveryPeriodEnd: string;
  DeliveryPeriodStart: string;
  FFQty?: number;
  FVMaxQty?: number;
  FVMinQty?: number;
  InitiatingParty?: string;
  ITMaxQty?: number;
  PerformanceType: PerformanceTypeCode;
  Price?: number;
  PriceIndex?: string;
  PriceIndexDifferential?: number;
  PriceType: PriceTypeCode;
  Reviewing?: string | null;
  SellerDealId?: string;
  SellerParty: string;
  SellerTrader?: string;
  Status: ChangeTypeStatusCode;
  DeliveryLocation: string;
  Revision: number;
  Facilities: string;
}

export interface ITradeViewModel extends Omit<ITrade, 'Facilities'> {
  Duration?: number;
  ChannelId: string;
  OrgDealId?: string;
  CounterpartyDealId?: string;
  CounterpartyId?: string;
  MaxTotalQuantity?: number;
  MinTotalQuantity?: number;
  MinDailyQuantity?: number;
  MaxDailyQuantity?: number;
  Type: string;
}

export interface ICreateTradeRequest {
  FFQty?: number;
  FVMaxQty?: number;
  Commodity: Commodity;
  DealId: string;
  DeliveryPeriodEnd: string;
  DeliveryPeriodStart: string;
  Price: number;
  PriceIndex: string;
  PriceIndexDifferential: number;
  QtyDay: number;
  BuyerTrader: string;
  SellerTrader: string;
  BuyerParty: string;
  BuyerDealId?: string;
  SellerDealId?: string;
  SellerParty: string;
  ITMaxQty?: number;
  PerformanceType: PerformanceTypeCode;
  PriceType: PriceTypeCode;
}

export interface IVoidTradeRequest {
  DealId: string;
}

export interface IUpdateTradeRequest {
  ChangeType: 'R' | 'A';
}

export interface IReviseTradeRequest {
  DealId: string;
}

export interface IAcceptTradeRequest {
  DealId: string;
  BuyerDealId?: string;
  SellerDealId?: string;
  BuyerTrader?: string;
  SellerTrader?: string;
}
