import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { TlsService } from 'src/tls/tls.service';

@Injectable()
export class TlsHealthcheck extends HealthIndicator {
  constructor(private readonly tlsService: TlsService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const isHealthy = this.tlsService.isReady();
    const result = this.getStatus('tls', isHealthy);

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError(`tls not ready`, result);
  }
}
