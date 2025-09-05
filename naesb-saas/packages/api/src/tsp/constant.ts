import {
  BusinessStatus,
  CompanyType,
  DirectionOfFlowCode,
  IDirectionOfFlow,
  ILocationTypeIndicator,
  LocationTypeIndicatorCode,
  TaxNumberType,
} from '@shared/model';
import { Organization } from 'src/db';

export const DIRECTION_OF_FLOW_DATA: Array<IDirectionOfFlow> = [
  {
    code: DirectionOfFlowCode.BIDIRECTIONAL,
    description: 'Bi-directional',
    abbreviation: 'Bi-Direct',
  },
  {
    code: DirectionOfFlowCode.DELIVERY,
    description: 'Delivery',
    abbreviation: 'Del',
  },
  {
    code: DirectionOfFlowCode.RECEIPT,
    description: 'Receipt',
    abbreviation: 'Rec',
  },
];

export const LOCATION_TYPE_INDICATOR_DATA: Array<ILocationTypeIndicator> = [
  {
    code: LocationTypeIndicatorCode.COMPRESSOR,
    description: 'Compressor',
    abbreviation: 'Compressor',
  },
  {
    code: LocationTypeIndicatorCode.END_USER,
    description: 'End-User',
    abbreviation: 'End-User',
  },
  {
    code: LocationTypeIndicatorCode.GAS_PLANT,
    description: 'Gas Plant',
    abbreviation: 'Plant',
  },
  {
    code: LocationTypeIndicatorCode.GATHERING,
    description: 'Gathering',
    abbreviation: 'Gathering',
  },
  {
    code: LocationTypeIndicatorCode.PIPELINE_INTERCONNECT,
    description: 'Pipeline Interconnect',
    abbreviation: 'Interconnect',
  },
  {
    code: LocationTypeIndicatorCode.LDC,
    description: 'LDC',
    abbreviation: 'LDC',
  },
  {
    code: LocationTypeIndicatorCode.LNG,
    description: 'LNG',
    abbreviation: 'LNG',
  },
  {
    code: LocationTypeIndicatorCode.OTHER,
    description: 'Other',
    abbreviation: 'Other',
  },
  {
    code: LocationTypeIndicatorCode.POOLING_POINT,
    description: 'Pooling Point',
    abbreviation: 'Pool',
  },
  {
    code: LocationTypeIndicatorCode.STANDALONE,
    description: 'Stand-alone',
    abbreviation: 'Stand-aln',
  },
  {
    code: LocationTypeIndicatorCode.STORAGE,
    description: 'Storage',
    abbreviation: 'Stor',
  },
  {
    code: LocationTypeIndicatorCode.VIRTUAL_POINT,
    description: 'Virtual Point',
    abbreviation: 'Virtual',
  },
  {
    code: LocationTypeIndicatorCode.WELLHEAD,
    description: 'Wellhead',
    abbreviation: 'Wellhead',
  },
];

export const pipelines: Array<Organization> = [
  {
    businessId: '1939164',
    taxNumber: '1939164',
    taxNumberType: TaxNumberType.US_FEDERAL,
    name: 'TENNESSEE GAS PIPELINE',
    fercCid: 'C000020',
    address: '1001 Louisiana Street Suite 1000 Houston, TX 77002 United States',
    website:
      'https://pipeportal.kindermorgan.com/portalui/DefaultKM.aspx?TSP=TGPD',
    jurisdiction: 'United States',
    companyType: CompanyType.LLC,
    businessStatus: BusinessStatus.ACTIVE,
  },
  {
    businessId: '115972101',
    taxNumber: '115972101',
    taxNumberType: TaxNumberType.US_FEDERAL,
    name: 'TEXAS GAS TRANSMISSION, LLC',
    fercCid: 'C000592',
    address: '610 W 2ND St Owensboro, KY, 42301-0739 United States',
    website:
      'https://www.txgt.com/about-us/subsidiaries/texas-gas-transmission-llc',
    jurisdiction: 'United States',
    companyType: CompanyType.LLC,
    businessStatus: BusinessStatus.ACTIVE,
  },
  {
    businessId: '187408526',
    taxNumber: '187408526',
    taxNumberType: TaxNumberType.US_FEDERAL,
    name: 'PINE PRAIRIE ENERGY CENTER, LLC',
    fercCid: 'C001058',
    address: '333 Clay St Ste 1300 Houston, TX, 77002-4006 United',
    website: 'http://www.gasnom.com/ip/pineprairie',
    jurisdiction: 'United States',
    companyType: CompanyType.LLC,
    businessStatus: BusinessStatus.ACTIVE,
  },
];
