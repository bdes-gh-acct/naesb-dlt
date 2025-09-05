export class authTokenResDto {
  access_token: string;
  scope: string;
  expires_in: number;
  token_type: string;
}

export class identitiesDto {
  connection: string;
  provider: string;
  user_id: string;
  isSocial: boolean;
}

export class userMetadataDto {
  certId: string;
}

export class authUpdateUserDto {
  created_at: string;
  email: string;
  email_verified: boolean;
  identities: identitiesDto[];
  name: string;
  nickname: string;
  picture: string;
  updated_at: string;
  user_id: string;
  multifactor: string[];
  multifactor_last_modified: string;
  user_metadata: authUpdateUserDto;
  last_password_reset: string;
  last_ip: string;
  last_login: string;
  logins_count: number;
}
