import { HttpService, logger } from '@shared/server-utils';
import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { resolve } from 'src/utils/dns';
import { AxiosError } from 'axios';
import { Agent } from 'https';

const {
  VAULT_SERVICE_NAME = 'vault',
  TOKEN_PATH = '/tmp/token/vault-token-via-agent',
  VAULT_ADDRESS,
  ORG_NAME,
  DOMAIN,
} = process.env;

export interface VaultResponse<TData> {
  data: TData;
  lease_id: string;
  renewable: boolean;
  lease_duration: number;
  warnings: string;
}

export interface CreateCertResponseData {
  certificate: string;
  issuing_ca: string;
  ca_chain: Array<string>;
  private_key: string;
  private_key_type: 'rsa';
  serial_number: string;
}

@Injectable()
export class VaultService {
  ready = false;
  constructor(private httpService: HttpService) {}
  private async getVaultPath() {
    if (VAULT_ADDRESS) {
      return VAULT_ADDRESS;
    }
    return await resolve(
      VAULT_SERVICE_NAME,
      process.env.CONSUL_DATACENTER,
      process.env.VAULT_TLS ? 'https' : 'http',
    );
  }

  private getVaultToken() {
    const token = fs.readFileSync(TOKEN_PATH).toString();
    return token;
  }
  private getCa() {
    const { VAULT_CACERT } = process.env;
    if (VAULT_CACERT) {
      if (fs.existsSync(VAULT_CACERT)) {
        return fs.readFileSync(VAULT_CACERT).toString();
      } else {
        logger.warn(`Invalid CA Path. ${VAULT_CACERT} not found`);
      }
    }
  }

  async post<Body, Response>(extension: string, payload: Body) {
    const ca = this.getCa();
    const headers = { 'X-Vault-Token': this.getVaultToken() };
    const vaultAddr = await this.getVaultPath();
    const path = `${vaultAddr}/${extension}`;
    // eslint-disable-next-line no-console
    console.log('Post Path: ', path);
    // eslint-disable-next-line no-console
    console.log('Post Payload: ', payload);
    // eslint-disable-next-line no-console
    console.log('Post Header: ', headers);
    try {
      return (
        await this.httpService.post<Response>(path, payload, {
          headers,
          httpsAgent: ca ? new Agent({ ca }) : undefined,
        })
      ).data;
    } catch (e) {
      const error = e as AxiosError;
      console.log(error.response?.data);
      throw e;
    }
  }

  async put<Body, Response>(extension: string, payload: Body) {
    const ca = this.getCa();
    const headers = { 'X-Vault-Token': this.getVaultToken() };
    const vaultAddr = await this.getVaultPath();
    const path = `${vaultAddr}/${extension}`;
    // eslint-disable-next-line no-console
    console.log('Put Path: ', path);
    // eslint-disable-next-line no-console
    console.log('Put Payload: ', payload);
    // eslint-disable-next-line no-console
    console.log('Put Header: ', headers);
    try {
      return (
        await this.httpService.put<Response>(path, payload, {
          headers,
          httpsAgent: ca ? new Agent({ ca }) : undefined,
        })
      ).data;
    } catch (e) {
      const error = e as AxiosError;
      console.log(error.response?.data);
      throw e;
    }
  }

  async get<Response>(extension: string, list?: boolean) {
    const ca = this.getCa();
    const headers = { 'X-Vault-Token': this.getVaultToken() };
    const vaultAddr = await this.getVaultPath();
    const path = `${vaultAddr}/${extension}`;
    // eslint-disable-next-line no-console
    console.log('Get Path: ', path);
    // eslint-disable-next-line no-console
    console.log('Get Header: ', headers);
    try {
      return await (
        await this.httpService.get<Response>(path, {
          headers: headers,
          httpsAgent: ca ? new Agent({ ca }) : undefined,
          params: list ? { list: true } : undefined,
        })
      ).data;
    } catch (e) {
      const error = e as AxiosError;
      console.error(error?.response.data || `${error.message}`);
      throw e;
    }
  }

  async generatePkiMount(path: string, max_lease_ttl = '87600h') {
    console.log(`Creating PKI Mount: ${path}`);
    const exists = await this.mountExists(path);
    if (!exists) {
      const result = await this.post(`v1/sys/mounts/${path}`, {
        type: 'pki',
        config: {
          max_lease_ttl,
        },
      });
      console.log(`PKI Mount: ${path} created!`);
      return result;
    } else {
      logger.warn(`Mount ${path} already exists`);
    }
  }

  async mountExists(path) {
    const mounts: any = await this.get(`v1/sys/mounts`);
    try {
      return Boolean((mounts as any).data[`${path}/`]);
    } catch (e) {
      return false;
    }
  }

  async generateRootCert(
    path: string,
    country: string,
    province: string,
    locality: string,
    ttl = '87600h',
  ) {
    const existing = await this.getRoot(path);
    if (!existing) {
      const payload = {
        common_name: `${path?.includes('msp') ? 'ca' : 'tlsca'}.${ORG_NAME}.${
          process.env.DOMAIN
        }`,
        ttl,
        country,
        province,
        locality,
        exclude_cn_from_sans: true,
        organization: `${ORG_NAME}.${DOMAIN}`,
      };
      return await this.post(`v1/${path}/root/generate/internal`, payload);
    } else {
      logger.warn(`Root cert for ${path} already exists`);
    }
  }

  async getRoot(path: string) {
    return await this.get(`v1/${path}/ca/pem`);
  }

  async generateRole(
    path: string,
    name: string,
    domains: Array<string>,
    key_type: string,
    key_bits: number,
    include_ou = false,
    max_ttl = '87600h',
    key_usage = ['DigitalSignature', 'KeyAgreement', 'KeyEncipherment'],
  ) {
    console.log(`Generating role: ${name} for ${path}`);
    let existing: any;
    try {
      existing = await this.get(`v1/${path}/roles`, true);
    } catch (e) {
      const status = (e as AxiosError).response.status;
      if (status !== 404) {
        logger.error(`${status} error fetching roles for ${path}`);
      } else {
        logger.warn(`No roles found for ${path}`);
      }
    }
    if (!existing || !existing.data?.keys.includes(name)) {
      let payload: any = {
        allowed_domains: domains,
        allowed_other_sans: '*',
        enforce_hostnames: false,
        allow_subdomains: true,
        allow_bare_domains: true,
        max_ttl,
        ou: include_ou ? name : undefined,
        key_type,
        key_bits,
        key_usage,
      };
      if (key_type) {
        payload = { ...payload, key_type };
      }
      if (key_bits) {
        payload = { ...payload, key_bits };
      }
      const result = await this.post(`v1/${path}/roles/${name}`, payload);

      return result;
    } else {
      logger.warn(`Role ${name} from ${path} already exists`);
    }
  }

  async generateCert(
    path: string,
    role: string,
    common_name: string,
    alt_names?: Array<string>,
    key_type?: string,
    key_bits?: number,
  ) {
    let payload: any = {
      common_name,
      exclude_cn_from_sans: true,
      ttl: '360h',
    };
    if (key_type) {
      payload = { ...payload, key_type };
    }
    if (key_bits) {
      payload = { ...payload, key_bits };
    }
    if (alt_names) {
      payload = { ...payload, alt_names: alt_names.join(', ') };
    }
    return await this.post<any, VaultResponse<CreateCertResponseData>>(
      `v1/${path}/issue/${role}`,
      payload,
    );
  }

  async saveKey<TData>(orgId: string, key: string, payload: TData) {
    return await this.post<any, any>(
      `v1/secrets/${orgId}/data/${key}`,
      payload,
    );
  }

  async getKey<TData>(orgId: string, key: string) {
    return await this.get<VaultResponse<TData>>(
      `v1/secrets/${orgId}/data/${key}`,
    );
  }
}
