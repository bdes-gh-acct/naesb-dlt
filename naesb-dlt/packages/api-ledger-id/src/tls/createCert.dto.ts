export class CreateCertDto {
  role: string;
  name: string;
  alt_names?: Array<string>;
}

export class tlsCertPackageDto {
  ca: string;
  serverCert: string;
  serverPk: string;
}
