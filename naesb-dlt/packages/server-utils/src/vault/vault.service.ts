import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { resolve } from 'src/utils/dns';
import { AxiosError } from 'axios';
import { Agent } from 'https';
import { HttpService } from 'src/http';
import { logger } from 'src/logger';

const {
  VAULT_SERVICE_NAME = 'vault',
  TOKEN_PATH = '/tmp/token/vault-token-via-agent',
  VAULT_ADDRESS,
  ORG_ID,
  ORG_NAME,
} = process.env;

@Injectable()
export class VaultService {
  ready = false;

  constructor(private httpService: HttpService) {}

  private async getVaultPath() {
    if (VAULT_ADDRESS) {
      return VAULT_ADDRESS;
    }
    return resolve(VAULT_SERVICE_NAME);
  }

  private getVaultToken() {
    const token = fs.readFileSync(TOKEN_PATH).toString();
    return token;
  }

  async post<Body, Response>(extension: string, payload: Body) {
    const ca = this.getCa();
    const headers = { 'X-Vault-Token': this.getVaultToken() };
    const vaultAddr = await this.getVaultPath();
    const path = `${vaultAddr}/${extension}`;
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

  private getCa() {
    const { VAULT_CACERT } = process.env;
    if (VAULT_CACERT) {
      if (fs.existsSync(VAULT_CACERT)) {
        return fs.readFileSync(VAULT_CACERT).toString();
      } 
        logger.warn(`Invalid CA Path. ${VAULT_CACERT} not found`);
      
    }
  }

  async get<Response>(extension: string, list?: boolean) {
    const ca = this.getCa();
    const headers = { 'X-Vault-Token': this.getVaultToken() };
    const vaultAddr = await this.getVaultPath();
    const path = `${vaultAddr}/${extension}`;
    try {
      return (
        await this.httpService.get<Response>(path, {
          headers,
          httpsAgent: ca ? new Agent({ ca }) : undefined,
          params: list ? { list: true } : undefined,
        })
      ).data;
    } catch (e) {
      const error = e as AxiosError;
      console.log(error.request.path);
      console.log(error.response?.data);
      throw e;
    }
  }

  async getRoot(path: string) {
    return this.get(`v1/${path}/ca/pem`);
  }

  async getCert(path: string, serial: string) {
    return this.get(`v1/${path}/cert/${serial}`);
  }

  async generateRole(
    path: string,
    name: string,
    organization: string,
    key_type: string,
    key_bits: number,
    max_ttl = '87600h',
    key_usage = ['DigitalSignature', 'KeyAgreement', 'KeyEncipherment'],
  ) {
    const domains = [
      `${organization}.${process.env.DOMAIN}`,
      `${name}-${ORG_ID}.service.consul`,
      `${name}-${ORG_NAME}.service.consul`,
    ];
    let payload: any = {
      allowed_domains:
        name === 'admin' ? [...domains, `${process.env.DOMAIN}`] : domains,
      allow_any_name: name === 'admin' || name === 'basic',
      allowed_other_sans: '*',
      enforce_hostnames: false,
      allow_subdomains: true,
      max_ttl,
      ou: name,
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
    return this.post(`v1/${path}/roles/${name}`, payload);
  }

  async generateCert(
    path: string,
    role: string,
    name: string,
    server_flag?: boolean,
    client_flag?: boolean,
  ) {
    const payload: any = {
      common_name: `${name}${process.env.DOMAIN}`,
      server_flag,
      client_flag,
    };
    return this.post(`v1/${path}/issue/${role}`, payload);
  }
}
