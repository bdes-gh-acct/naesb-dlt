/* eslint-disable @typescript-eslint/lines-between-class-members */
export class Auth0TokenReqDto {
  client_id: string;
  client_secret: string;
  audience: string;
  grant_type: string;
}

export class Auth0TokenResDto {
  access_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
}

export class IdentitiesDto {
  connection: string;
  provider: string;
  user_id: string;
  isSocial: boolean;
}

export class Auth0AppMetadataDto {
  authorization: Auth0AuthorizationDto;
}

export class Auth0AuthorizationDto {
  roles: string[];
  permissions: string[];
}

export class Auth0GetUserResDto {
  created_at: string;
  email: string;
  email_verified: boolean;
  identities: IdentitiesDto[];
  name: string;
  nickname: string;
  picture: string;
  updated_at: string;
  user_id: string;
  multifactor: string[];
  multifactor_last_modified: string;
  app_metadata: Auth0AppMetadataDto;
  last_password_reset: string;
  last_ip: string;
  last_login: string;
  logins_count: number;
}

export class Auth0UpdateUserReqDto {
  email?: string;
  name?: string;
  nickname?: string;
}

export class Auth0UserReqDto {
  iss: string;
  sub: string;
  aud: string[];
  iat: number;
  exp: number;
  azp: string;
  scope: string;
  org_id: string;
}

export class Auth0BrandingReq {
  name?: string;
  display_name?: string;
  branding?: {
    logo_url?: string;
    colors?: Auth0ColorsReq;
  };
}

export class Auth0ColorsReq {
  primary: string;
  page_background: string;
}

export class Auth0OrgReqDto {
  id: string;
  name: string;
  display_name: string;
  branding: {
    logo_url: string;
    colors: {
      primary: string;
      page_background: string;
    };
  };
  metadata: any;
}
