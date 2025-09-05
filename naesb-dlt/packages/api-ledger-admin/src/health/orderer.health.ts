import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { OrdererService } from 'src/orderer/orderer.service';

@Injectable()
export class OrdererHealthCheck extends HealthIndicator {
  constructor(private readonly ordererService: OrdererService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const isHealthy = this.ordererService.isReady();
    const result = this.getStatus('orderer', isHealthy);

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError(`orderer not ready`, result);
  }
}
