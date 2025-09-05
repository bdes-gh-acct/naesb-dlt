import { Injectable } from '@nestjs/common';
import {
  HealthIndicator,
  HealthIndicatorResult,
  HealthCheckError,
} from '@nestjs/terminus';
import { ChannelService } from 'src/channel/channel.service';

@Injectable()
export class ChannelHealthCheck extends HealthIndicator {
  constructor(private readonly channelService: ChannelService) {
    super();
  }

  async isHealthy(): Promise<HealthIndicatorResult> {
    const isHealthy = this.channelService.isReady();
    const result = this.getStatus('channel', isHealthy);

    if (isHealthy) {
      return result;
    }
    throw new HealthCheckError(`channel not ready`, result);
  }
}
