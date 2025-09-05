/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@shared/server-utils';
import { env } from '../env';

const { CA_ADDRESS } = env;

@Injectable()
export class CaService {
  ready = false;

  constructor(private httpService: HttpService) {}

  async post<Body, Response>(extension: string, payload: Body) {
    const path = `${CA_ADDRESS}/api/ca/v1${extension}`;
    try {
      const response = await this.httpService.post<Response>(path, payload);
      return response.data;
    } catch (e) {
      console.log(e?.response?.data);
      throw new Error((e as Error).message);
    }
  }

  async get<Response>(extension: string) {
    const path = `${CA_ADDRESS}/api/ca/v1${extension}`;
    try {
      return (await this.httpService.get<Response>(path)).data;
    } catch (e) {
      console.log(e?.response.data);
      throw e;
    }
  }

  async createUser(name: string, role = 'client') {
    const response: any = await this.post('/msp/certs', {
      role,
      name,
    });
    return {
      private_key: response.data.private_key as string,
      certificate: response.data.certificate as string,
      issuing_ca: response.data.issuing_ca as string,
    };
  }

  async getUser(
    name: string,
    role = 'client',
  ): Promise<{
    private_key: string;
    certificate: string;
    issuing_ca: string;
    serial_number: string;
  }> {
    const response = await this.get<{
      private_key: string;
      certificate: string;
      issuing_ca: string;
      serial_number: string;
    }>(`/msp/certs/${role}/${name}`);
    return response;
  }

  async createTlsCert(name: string, role = 'client') {
    const response: any = await this.post('/tls/certs', {
      role,
      name,
    });
    return {
      private_key: response.data.private_key as string,
      certificate: response.data.certificate as string,
      issuing_ca: response.data.issuing_ca as string,
    };
  }

  async getTlsCa(): Promise<string> {
    return this.get('/tls/root');
  }

  async getMspCa(): Promise<string> {
    return this.get('/msp/root');
  }
}
