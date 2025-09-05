import { Injectable } from '@nestjs/common';
import { CreateCertResponseData, VaultService } from '../vault/vault.service';
import { z } from 'zod';
import { apiValidate } from '@shared/server-utils';

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
  DOMAIN,
} = process.env;

export type CreateCertRequest = z.infer<typeof createCertSchema>;
export type GetUserRequest = z.infer<typeof getCertSchema>;

const KEY_BITS = Number(MSP_KEY_BITS);
const MOUNT_PATH = `${ORG_ID}/msp`;

const createCertSchema = z.object({
  name: z.string(),
  role: z.enum(['admin', 'client', 'orderer', 'peer']),
});

const getCertSchema = z.object({
  name: z.string(),
  role: z.enum(['admin', 'client', 'orderer', 'peer']),
});

@Injectable()
export class MspService {
  private ready = false;

  constructor(private readonly vaultService: VaultService) {
    this.init();
  }

  private async init() {
    await this.vaultService.generatePkiMount(MOUNT_PATH);
    await this.vaultService.generateRootCert(
      MOUNT_PATH,
      COUNTRY,
      PROVINCE,
      LOCALITY,
    );
    const domains = [`${ORG_NAME}.${DOMAIN}`, ORG_NAME];
    if (PEER_CERTS_ENABLED) {
      await this.vaultService.generateRole(
        MOUNT_PATH,
        'peer',
        domains,
        MSP_KEY_TYPE,
        KEY_BITS,
        true,
      );
    }

    if (ORDERER_CERTS_ENABLED) {
      await this.vaultService.generateRole(
        MOUNT_PATH,
        'orderer',
        domains,
        MSP_KEY_TYPE,
        KEY_BITS,
        true,
      );
    }
    if (ADMIN_CERTS_ENABLED) {
      await this.vaultService.generateRole(
        MOUNT_PATH,
        'admin',
        [`*@${ORG_NAME}.${DOMAIN}`, ...domains],
        MSP_KEY_TYPE,
        KEY_BITS,
        true,
      );
    }
    if (CLIENT_CERTS_ENABLED) {
      await this.vaultService.generateRole(
        MOUNT_PATH,
        'client',
        domains,
        MSP_KEY_TYPE,
        KEY_BITS,
        true,
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

  async getUser(request: GetUserRequest) {
    const { role, name } = await apiValidate(getCertSchema, request);
    const userData = await this.vaultService.getKey<CreateCertResponseData>(
      ORG_ID,
      `${role}/${name}`,
    );
    return userData.data;
  }

  async createCert(request: CreateCertRequest) {
    const { role, name } = await apiValidate(createCertSchema, request);
    const common_name = ['orderer', 'peer', 'client'].includes(role)
      ? `${name}.${ORG_NAME}.${process.env.DOMAIN}`
      : `${name}@${ORG_NAME}.${process.env.DOMAIN}`;
    console.log(`Creating cert ${common_name} for role: ${role}`);
    const result = await this.vaultService.generateCert(
      MOUNT_PATH,
      role,
      common_name,
    );
    await this.vaultService.saveKey(ORG_ID, `${role}/${name}`, result.data);
    return result;
  }
}
