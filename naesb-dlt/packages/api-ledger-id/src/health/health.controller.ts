import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  TypeOrmHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';
import { Public } from '@shared/server-utils';
import { MspHealthcheck } from './msp.health';
import { TlsHealthcheck } from './tls.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private mspHealth: MspHealthcheck,
    private tlsHealth: TlsHealthcheck,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.mspHealth.isHealthy(),
      () => this.tlsHealth.isHealthy(),
    ]);
  }
}
