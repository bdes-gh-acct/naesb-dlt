/* eslint-disable no-await-in-loop */
import axios, { AxiosError } from 'axios';
import { get } from 'lodash';
import * as dotenv from 'dotenv';
import { Injectable } from '@nestjs/common';
import { IndyTransaction, LedgerType } from '@naesb/aries-types';

dotenv.config();

const { VDR_URL } = process.env;

@Injectable()
export class LedgerService {
  async getGenesis() {
    try {
      const response = await axios.get<unknown>(`${VDR_URL}/genesis`);
      return response.data;
    } catch (e) {
      console.log(e);
      return undefined;
    }
  }

  async getLedgerTransaction(sequence: number, ledger: LedgerType) {
    try {
      const response = await axios.get(`${VDR_URL}/txn/${ledger}/${sequence}`);
      if (response.data) {
        const txn = get(response.data, 'result.data') as IndyTransaction;
        if (txn) {
          return {
            sequence,
            txnId: txn.txnMetadata.txnId,
            value: txn,
            success: true,
          };
        }
      }
    } catch (e) {
      console.log(
        'FAILED TO GET LEDGER TRANSACTION',
        ledger,
        'SEQUENCE',
        sequence,
        'ERROR',
        e,
      );
    }
    return undefined;
  }

  async submitRequestToLedger(request: any) {
    try {
      const response = await axios.post(`${VDR_URL}/submit`, request);
      return { success: true, data: response.data };
    } catch (e) {
      console.log('SUBMIT REQUEST FAILED:', e);
      return { success: false, error: e };
    }
  }

  async getProxyStatus() {
    try {
      const response = await axios.get(VDR_URL as string);
      if (response.data && response.data.status === 'active') {
        return { active: true, data: response.data };
      }
      return { active: false, data: response.data };
    } catch (e) {
      console.log(
        `${(e as AxiosError).response?.status} Error from VDR. Status: ${
          ((e as AxiosError).response?.data as any)?.status
        }`,
      );
      return { active: false };
    }
  }

  async sleep(time: number) {
    // eslint-disable-next-line no-promise-executor-return
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  async untilActive() {
    let active = false;
    let tries = 0;
    while (!active && tries < 20) {
      await this.sleep(10000);
      const { active: isActive } = await this.getProxyStatus();
      active = isActive;
      // eslint-disable-next-line no-plusplus
      tries++;
    }
    if (!active) {
      throw new Error('VDR TIMEOUT ERROR');
    }
  }
}
