import { Injectable } from '@nestjs/common';
import { VaultService } from 'src/vault/vault.service';

const {
  ORG_NAME,
  ORG_ID,
  COUNTRY = 'US',
  PROVINCE = 'TX',
  LOCALITY = 'HOUSTON',
  PEER_CERTS_ENABLED = true,
  ORDERER_CERTS_ENABLED = true,
  CLIENT_CERTS_ENABLED = true,
  ADMIN_CERTS_ENABLED = true,
  MSP_KEY_TYPE = 'ec',
  MSP_KEY_BITS = 256,
} = process.env;

const KEY_BITS = Number(MSP_KEY_BITS);
const MOUNT_PATH = `${ORG_ID}/tls`;

@Injectable()
export class TlsService {
  private ready = false;
  constructor(private readonly vaultService: VaultService) {
    this.init();
  }

  private async init() {
    console.log('creating mount');
    await this.vaultService.generatePkiMount(MOUNT_PATH);
    await this.vaultService.generateRootCert(
      MOUNT_PATH,
      COUNTRY,
      PROVINCE,
      LOCALITY,
    );
    if (PEER_CERTS_ENABLED) {
      const peerDomains = [
        `${ORG_NAME}.${process.env.DOMAIN}`,
        `peer-${ORG_NAME}.service.consul`,
      ];
      await this.vaultService.generateRole(
        MOUNT_PATH,
        'peer',
        peerDomains,
        MSP_KEY_TYPE,
        KEY_BITS,
      );
    }
    if (ADMIN_CERTS_ENABLED) {
      const adminDomains = [
        `${ORG_NAME}.${process.env.DOMAIN}`,
        `admin-${ORG_NAME}.service.consul`,
      ];
      await this.vaultService.generateRole(
        MOUNT_PATH,
        'admin',
        adminDomains,
        MSP_KEY_TYPE,
        KEY_BITS,
      );
    }
    console.log('generating orderer role');
    if (ORDERER_CERTS_ENABLED) {
      const ordererDomains = [
        `${ORG_NAME}.${process.env.DOMAIN}`,
        `orderer-${ORG_NAME}.service.consul`,
      ];
      await this.vaultService.generateRole(
        MOUNT_PATH,
        'orderer',
        ordererDomains,
        MSP_KEY_TYPE,
        KEY_BITS,
      );
    }
    if (CLIENT_CERTS_ENABLED) {
      const clientDomains = [
        `${ORG_NAME}.${process.env.DOMAIN}`,
        `client-${ORG_NAME}.service.consul`,
      ];
      await this.vaultService.generateRole(
        MOUNT_PATH,
        'client',
        clientDomains,
        MSP_KEY_TYPE,
        KEY_BITS,
      );
    }
    this.ready = true;
  }

  isReady() {
    return this.ready;
  }

  getRoot() {
    return this.vaultService.getRoot(MOUNT_PATH);
  }

  createCert(role: string, name: string, alt_names: Array<string> = []) {
    const common_name = ['orderer', 'peer', 'client'].includes(role)
      ? name
      : `${name}.${ORG_NAME}.${process.env.DOMAIN}`;
    return this.vaultService.generateCert(
      MOUNT_PATH,
      role,
      common_name,
      role === 'admin' ? [common_name, ...alt_names] : [name, ...alt_names],
      MSP_KEY_TYPE,
      KEY_BITS,
    );
  }
}
