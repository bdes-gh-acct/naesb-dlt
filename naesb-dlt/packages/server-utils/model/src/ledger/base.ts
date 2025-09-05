import { Commodity } from './commodity';
import { ChangeTypeStatusCode } from './trade';

export const BASE_CONTRACT = 'BASE';

export enum ContractPaymentType {
  WIRE_TRANSFER = 'WT',
  ACH = 'ACH',
  CHECK = 'CH',
}

export const ContractPaymentTypes = [
  {
    Code: ContractPaymentType.WIRE_TRANSFER,
    DisplayName: 'Wire Transfer',
  },
  {
    Code: ContractPaymentType.ACH,
    DisplayName: 'Automated Clearinghouse Credit (ACH)',
  },
  {
    Code: ContractPaymentType.CHECK,
    DisplayName: 'Check',
  },
];

export enum ContractPerformanceObligationType {
  COVER = 'C',
  SPOT_PRICE = 'S',
}

export const ContractPerformanceObligationTypes = [
  {
    Code: ContractPerformanceObligationType.COVER,
    DisplayName: 'Cover Standard',
  },
  {
    Code: ContractPerformanceObligationType.SPOT_PRICE,
    DisplayName: 'Spot Price Standard',
  },
];

export enum SpotPricePublication {
  GAS_DAILY = 'GD',
  ARGUS = 'ARG',
}

export enum ContractTaxPaymentDueBy {
  BUYER = 'B',
  SELLER = 'S',
}

export enum ContractPaymentDateType {
  DAY_OF_MONTH = 'D',
  DAYS_AFTER_FLOW = 'A',
}

export const ContractTaxPaymentDueByTypes = [
  {
    Code: ContractTaxPaymentDueBy.BUYER,
    DisplayName: 'Buyer',
  },
  {
    Code: ContractTaxPaymentDueBy.SELLER,
    DisplayName: 'Seller',
  },
];

export const ContractSpotPublisherTypes = [
  {
    Code: SpotPricePublication.GAS_DAILY,
    DisplayName: 'Gas Daily Midpoint',
  },
  {
    Code: SpotPricePublication.ARGUS,
    DisplayName: 'Argus Natural Gas Americas VWA',
  },
];

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

export interface IBaseContract {
  Revision: number;
  Commodity: Commodity;
  TextHash?: string;
  Reviewing?: string;
  Status: ChangeTypeStatusCode;
  InitiatingParty: string;
  ReceivingParty: string;
  CommodityDetail: INaturalGasCommodityDetails;
  Approved?: IBaseContract;
}
