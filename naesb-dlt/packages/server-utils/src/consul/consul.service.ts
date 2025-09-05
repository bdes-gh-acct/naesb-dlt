/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@nestjs/common';
import { resolve } from 'src/utils/dns';
import { AxiosError } from 'axios';
import { VaultService } from 'src/vault/vault.service';
import { Agent } from 'https';
import * as fs from 'fs';
import { HttpService } from 'src/http';
import { logger } from 'src/logger';

const {
  CONSUL_SERVICE_NAME = 'consul',
  CONSUL_ADDRESS,
  ORG_ID,
  ORG_NAME,
  CONSUL_CACERT,
} = process.env;

@Injectable()
export class ConsulService {
  ready = false;

  constructor(
    private httpService: HttpService,
    private vaultService: VaultService,
  ) {}

  private async getConsulPath() {
    if (CONSUL_ADDRESS) {
      return CONSUL_ADDRESS;
    }
    return resolve(CONSUL_SERVICE_NAME, 8500);
  }

  private getCa() {
    if (CONSUL_CACERT) {
      if (fs.existsSync(CONSUL_CACERT)) {
        return fs.readFileSync(CONSUL_CACERT).toString();
      } 
        logger.warn(`Invalid CA Path. ${CONSUL_CACERT} not found`);
      
    }
  }

  async post<Body, Response>(extension: string, payload: Body) {
    const ca = this.getCa();
    const consulAddr = await this.getConsulPath();
    const path = `${consulAddr}/${extension}`;
    try {
      const response = await this.httpService.post<Response>(path, payload, {
        httpsAgent: ca ? new Agent({ ca }) : undefined,
      });
      return response.data;
    } catch (e) {
      const error = e as AxiosError;
      console.log(error?.response?.data);
      throw new Error();
    }
  }

  async get<Response>(extension: string) {
    const ca = this.getCa();
    const consulPath = await this.getConsulPath();
    const path = `${consulPath}/${extension}`;
    return (
      await this.httpService.get<Response>(path, {
        httpsAgent: ca ? new Agent({ ca }) : undefined,
      })
    ).data;
  }

  async getService(name: string, tag?: string) {
    return this.get(`/v1/catalog/service/${name}`);
  }

  async getKey(key: string) {
    return this.get(`/v1/kv/${key}`);
  }

  async getServiceCerts(name: string, org_id = ORG_ID, id?: string) {
    const tls_response: any = await this.getKey(
      `${id ? `${id}-` : ''}${name}-tls`,
    );
    const ca_response: any = await this.getKey(
      `${id ? `${id}-` : ''}${name}-ca`,
    );
    const tls_cert: any = await this.vaultService.getCert(
      `${org_id}/tls`,
      Buffer.from(tls_response[0].Value, 'base64').toString('utf8'),
    );
    const ca_cert: any = await this.vaultService.getCert(
      `${org_id}/msp`,
      Buffer.from(ca_response[0].Value, 'base64').toString('utf8'),
    );
    return {
      tls_cert: `${tls_cert.data.certificate  }\n`,
      ca_cert: `${ca_cert.data.certificate  }\n`,
    };
  }
}
