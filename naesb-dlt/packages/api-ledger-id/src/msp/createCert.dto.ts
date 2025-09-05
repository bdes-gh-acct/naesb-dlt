export class CreateCertDto {
  role: string;
  name: string;
}

export class tlsCertPackageDto {
  ca: string;
  serverCert: string;
  serverPk: string;
}
