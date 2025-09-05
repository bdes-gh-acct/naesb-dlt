/* eslint-disable @typescript-eslint/naming-convention */
import { Injectable } from '@nestjs/common';
import { IChannel } from '@naesb/dlt-model';
import { HttpService } from '@shared/server-utils';

const { LEDGER_ADDRESS } = process.env;

@Injectable()
export class LedgerService {
  ready = false;

  constructor(private httpService: HttpService) {}

  async get<Response>(extension: string, token: string) {
    const path = `${LEDGER_ADDRESS}/api/ledger/v1${extension}`;
    console.log('Channels path: ');
    console.log(`${LEDGER_ADDRESS}/api/ledger/v1${extension}`);
    try {
      return (
        await this.httpService.get<Response>(path, {
          headers: { authorization: token },
        })
      ).data;
    } catch (e) {
      console.log('Failed to get channels.');
      console.log(e?.response.data);
      throw e;
    }
  }

  async getChannels(
    token: string,
  ): Promise<{ data: Array<IChannel>; totalRecords: number }> {
    console.log('Getting channels from ledger API.')
    return this.get('/channels', token);
  }
}
