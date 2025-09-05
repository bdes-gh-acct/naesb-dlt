/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@nestjs/common';
import { HttpService } from '@shared/server-utils';

const { REGISTRY_ADDRESS } = process.env;

@Injectable()
export class RegistryService {
  ready = false;

  constructor(private httpService: HttpService) {}

  async get<Response>(extension: string, token: string) {
    const path = `${REGISTRY_ADDRESS}/api/saas/v1${extension}`;
    try {
      return (
        await this.httpService.get<Response>(path, {
          headers: { authorization: token },
        })
      ).data;
    } catch (e) {
      console.log(e?.response.data);
      throw e;
    }
  }

  async post<Response>(extension: string, body: any, token: string) {
    const path = `${REGISTRY_ADDRESS}/api/saas/v1${extension}`;
    try {
      return (
        await this.httpService.post<Response>(path, body, {
          headers: { authorization: token },
        })
      ).data;
    } catch (e) {
      console.log(e?.response?.data);
      throw e;
    }
  }
}
