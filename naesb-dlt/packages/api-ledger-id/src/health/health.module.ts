import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { TerminusModule } from '@nestjs/terminus';
import { MspModule } from 'src/msp/msp.module';
import { MspHealthcheck } from './msp.health';
import { TlsModule } from 'src/tls/tls.module';
import { TlsHealthcheck } from './tls.health';

@Module({
  imports: [TerminusModule, MspModule, TlsModule],
  controllers: [HealthController],
  providers: [MspHealthcheck, TlsHealthcheck],
})
export class HealthModule {}
