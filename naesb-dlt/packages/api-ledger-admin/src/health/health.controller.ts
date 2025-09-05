import { Controller, Get } from '@nestjs/common';
import { HealthCheckService, HealthCheck } from '@nestjs/terminus';
import { Public } from '@shared/server-utils';
import { ChannelHealthCheck } from './channel.health';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private channelHealthCheck: ChannelHealthCheck,
  ) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    return this.health.check([() => this.channelHealthCheck.isHealthy()]);
  }
}
