export enum DirectionOfFlowCode {
  DELIVERY = 'D',
  BIDIRECTIONAL = 'B',
  RECEIPT = 'R',
}

export interface IDirectionOfFlow {
  Code: DirectionOfFlowCode;
  Description: string;
  Abbreviation: string;
}

export interface ILocationTypeIndicator {
  Code: LocationTypeIndicatorCode;
  Description: string;
  Abbreviation: string;
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

export interface ITransportationServiceProvider {
  Id: number;
  Name: string;
  FercCid: string;
  Active: boolean;
}

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
