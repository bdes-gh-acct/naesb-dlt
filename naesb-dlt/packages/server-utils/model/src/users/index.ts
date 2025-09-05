export interface IIdentities {
  connection: string;
  provider: string;
  user_id: string;
  isSocial: boolean;
}

export interface IAppMetadata {
  authorization: IAuthorization;
}

export interface IUserMetadata {
  certId?: string;
  attention?: string;
  base_contract_number?: string;
  fax_number?: string;
  im_carrier?: string;
  im_id?: string;
  phone_number?: string;
}

export interface IAuthorization {
  roles: string[];
  permissions: string[];
}

export interface IUser {
  created_at?: string;
  email?: string;
  email_verified?: boolean;
  identities?: IIdentities[];
  name?: string;
  family_name?: string;
  given_name?: string;
  middle_name?: string;
  nickname?: string;
  picture?: string;
  updated_at?: string;
  user_id?: string;
  last_password_reset?: string;
  multifactor?: string[];
  multifactor_last_modified?: string;
  user_metadata?: IUserMetadata;
  app_metadata?: IAppMetadata;
  last_ip?: string;
  last_login?: string;
  logins_count?: number;
}
