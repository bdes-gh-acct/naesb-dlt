export interface IOrganization {
  name: string;
  fercCid?: string;
  address?: string;
  website?: string;
  businessId: string;
  taxNumber: string;
  taxNumberType: TaxNumberType;
  jurisdiction?: string;
  companyType: CompanyType;
  otherCompanyType?: string;
  businessTypes?: Array<IBusinessTypeJoin>;
  businessStatus: BusinessStatus;
  did?: string;
  verKey?: string;
  internalId?: string;
  endpoint?: string;
}

export interface IUserOrganization {
  userId: string;
  businessId: string;
}

export interface QueryResult<T> {
  data: Array<T>;
  totalRecords: number;
  timestamp: string;
}

export interface IBusinessTypeJoin {
  businessId: string;
  typeId: string;
}

export interface IBusinessType {
  id: string;
  type: BusinessType;
}

export enum BusinessType {
  PRODUCER = 'PRODUCER',
  CERTIFIER = 'CERTIFIER',
  TRADER = 'TRADER',
}

export enum BusinessStatus {
  SUBMITTED = 'SUBMITTED', // Members who have submitted initial information
  APPROVED = 'APPROVED', // Members who have been approved for onboarding
  REJECTED = 'REJECTED', // Members who have not met NAESB's requirements
  ACTIVE = 'ACTIVE', // Members who have completely onboarded
}

export enum TaxNumberType {
  US_FEDERAL = 'US Federal',
  OTHER = 'Other',
}

export enum CompanyType {
  CORPORATION = 'Corporation',
  LLC = 'LLC',
  LIMITED_PARTNERSHIP = 'Limited Partnership',
  PARTNERSHIP = 'Partnership',
  LLP = 'LLP',
  OTHER = 'Other',
}

export enum DirectionOfFlowCode {
  DELIVERY = 'D',
  BIDIRECTIONAL = 'B',
  RECEIPT = 'R',
}

export interface IDirectionOfFlow {
  code: DirectionOfFlowCode;
  description: string;
  abbreviation: string;
}

export interface ILocationTypeIndicator {
  code: LocationTypeIndicatorCode;
  description: string;
  abbreviation: string;
}

export enum LocationTypeIndicatorCode {
  COMPRESSOR = 'COM',
  END_USER = 'END',
  GAS_PLANT = 'PLT',
  GATHERING = 'GTH',
  PIPELINE_INTERCONNECT = 'INT',
  LDC = 'LDC',
  LNG = 'LNG',
  OTHER = 'OTH',
  POOLING_POINT = 'PPT',
  STANDALONE = 'STA',
  STORAGE = 'STR',
  VIRTUAL_POINT = 'VIR',
  WELLHEAD = 'WHD',
}

export enum LocationStatusIndicatorCode {
  ACTIVE = 'A',
  INACTIVE = 'I',
}

// export interface ITransportationServiceProvider {
//   Id: number;
//   Name: string;
//   FercCid: string;
//   Active: boolean;
// }

export interface ITspLocation {
  locationId: string;
  businessId: string;
  locationName: string;
  createDate: string;
  effectiveDate: string;
  locator?: string;
  locatorIdentifier?: string;
  inactiveDate?: string;
  updateDate: string;
  state: string;
  comments?: string;
  county: string;
  zone?: string;
  typeIndicator?: LocationTypeIndicatorCode;
  statusIndicator: LocationStatusIndicatorCode;
  directionOfFlow: DirectionOfFlowCode;
  upstreamDownstreamEntityIndicator: string;
  upstreamDownstreamEntityName?: string;
  upstreamDownstreamEntityLocation?: string;
  upstreamDownstreamEntityLocationName?: string;
  upstreamDownstreamIdentifierCode?: string;
  upstreamDownstreamIdentifierProprietaryCode?: string;
  upstreamDownstreamEntityFercCid?: string;
  upstreamDownstreamEntityFercCidIndicator?: string;
}

export interface IPriceIndexProvider {
  id: string;
  name: string;
  abbreviation: string;
}

export interface IPriceIndex {
  id: string;
  providerId: string;
  name: string;
  nrovider?: IPriceIndexProvider;
}

export interface IPriceIndexValue {
  id: string;
  indexId: string;
  midpoint: number;
}

export interface IWell {
  businessId: string;
  id: string;
  name: string;
  createdBy: string;
  created?: Date;
  fieldId?: string;
  updated?: Date;
  updatedBy: string;
}

export interface IField {
  businessId: string;
  id: string;
  name: string;
  createdBy: string;
  created?: Date;
  updated?: Date;
  updatedBy: string;
}
