import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { MspService } from 'src/msp/msp.service';

@Injectable()
export class MspHealthcheck extends HealthIndicator {
  constructor(private readonly mspService: MspService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const isHealthy = this.mspService.isReady();
    const result = this.getStatus('msp', isHealthy);

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError(`msp not ready`, result);
  }
}
