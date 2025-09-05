export class vaultLoginReqDto {
  jwt: string;
  role: string;
  authSub?: string;
  certId?: string;
}

export class vaultTidyReqDto {
  tidy_cert_store: boolean;
  tidy_revoked_certs: boolean;
  safety_buffer: string;
}

export class certificateDataDto {
  certificate: string;
  private_key?: string;
  serial_number?: string;
}

export class vaultBaseResDto {
  requestId: string;
  lease_id: string;
  renewable: boolean;
  lease_duration: number;
  data: any;
  wrap_info: any;
  warnings: any;
  auth: any;
}

export class vaultLoginResDto extends vaultBaseResDto {
  auth: {
    client_token: string;
    accessor: string;
    policies: string[];
    token_policies: string[];
    metadata: any;
    lease_duration: number;
    renewable: boolean;
    entity_id: string;
    token_type: string;
    orphan: boolean;
  };
}

export class vaultGetCertResDto extends vaultBaseResDto {
  data: {
    certificate: string;
    revocation_time: number;
  };
}

export class vaultNewCertResDto extends vaultBaseResDto {
  data: {
    certificate: string;
    expiration: number;
    issuing_ca: string;
    private_key: string;
    private_key_type: string;
    serial_number: string;
  };
}

export class vaultTidyResDto extends vaultBaseResDto {
  warnings: string[];
}

export class vaultRevokeResDto extends vaultBaseResDto {
  data: {
    revocation_time: number;
    revocation_time_rfc3339: string;
  };
}

export class vaultGenerateRootResDto extends vaultBaseResDto {
  data: {
    certificate: string;
    expiration: number;
    issuing_ca: string;
    serial_number: string;
  };
}
