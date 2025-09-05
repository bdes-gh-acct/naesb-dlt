/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@shared/server-utils';

const { CA_ADDRESS } = process.env;

@Injectable()
export class CaService {
  ready = false;

  constructor(private httpService: HttpService) {}

  async get<Response>(extension: string) {
    const path = `${CA_ADDRESS}/api/ca/v1${extension}`;
    try {
      return (await this.httpService.get<Response>(path)).data;
    } catch (e) {
      console.log(e?.response.data);
      throw e;
    }
  }

  async getTlsCa(): Promise<string> {
    console.log('Getting TLS for');
    console.log(`${CA_ADDRESS}`);
    return this.get('/tls/root');
  }

  async getMspCa(): Promise<string> {
    console.log('Getting MSP for');
    console.log(`${CA_ADDRESS}`);
    return this.get('/msp/root');
  }
}
