import { IConnection } from '../aries';
import { IChannel } from '../ledger';

export interface IRegistryOrganization {
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

export enum BusinessRole {
  ADMIN = 1,
  TRADER = 2,
  CERTIFIER = 3,
  TSP = 4,
}

export interface IRole {
  Name: string;
  Id: BusinessRole;
}

export interface IBusinessRoleJunction {
  role: IRole;
  businessId: string;
  businessRoleId: BusinessRole;
}

export interface IDirectory extends IRegistryOrganization {
  channel: IChannel;
  connection: IConnection;
  roles: Array<IBusinessRoleJunction>;
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
