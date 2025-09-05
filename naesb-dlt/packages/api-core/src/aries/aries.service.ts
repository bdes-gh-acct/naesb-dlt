/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@nestjs/common';
import { IConnection } from '@naesb/dlt-model';
import { HttpService } from '@shared/server-utils';

const { ARIES_ADDRESS } = process.env;

@Injectable()
export class AriesService {
  ready = false;

  constructor(private httpService: HttpService) {}

  async get<Response>(extension: string, token: string) {
    const path = `${ARIES_ADDRESS}/api/agent/v1${extension}`;
    console.log('Connections path: ');
    console.log(`${ARIES_ADDRESS}/api/agent/v1${extension}`);
    try {
      return (
        await this.httpService.get<Response>(path, {
          headers: { authorization: token },
        })
      ).data;
    } catch (e) {
      console.log(e);
      console.log(e?.response.data);
      throw e;
    }
  }

  async getConnections(
    token: string,
  ): Promise<{ data: Array<IConnection>; totalRecords: number }> {
    console.log('Getting connections.');
    return this.get('/connections', token);
  }
}
