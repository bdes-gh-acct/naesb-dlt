export class vaultHealthResDto {
  initialized: boolean;
  sealed: boolean;
  standby: boolean;
  performance_standby: boolean;
  replication_performance_mode: string;
  replication_dr_mode: string;
  server_time_utc: number;
  version: string;
  cluster_name: string;
  cluster_id: string;
}

export class tlsCertPackageDto {
  ca: string;
  serverCert: string;
  serverPk: string;
}
