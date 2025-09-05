import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { Public } from '@shared/server-utils';
import { ChaincodeHealthcheck } from './chaincode.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private chaincodeHealthcheck: ChaincodeHealthcheck,
  ) {}

  @Public()
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([() => this.chaincodeHealthcheck.isHealthy()]);
  }
}
