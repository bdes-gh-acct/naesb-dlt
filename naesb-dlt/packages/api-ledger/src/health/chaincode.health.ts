/* eslint-disable @typescript-eslint/require-await */
import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { ChaincodeService } from '../peer/chaincode.service';

@Injectable()
export class ChaincodeHealthcheck extends HealthIndicator {
  constructor(private readonly chaincodeService: ChaincodeService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const isHealthy = this.chaincodeService.isReady();
    const result = this.getStatus('chaincode', isHealthy);

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError(`chaincode not ready`, result);
  }
}
