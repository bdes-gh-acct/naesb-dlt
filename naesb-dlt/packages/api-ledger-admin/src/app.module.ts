import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { TerminusModule } from '@nestjs/terminus';
import { JwtAuthGuard, JwtStrategy } from '@shared/server-utils';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    TerminusModule,
    PassportModule,
    ConfigModule.forRoot({ isGlobal: true }),
    HealthModule,
  ],
  controllers: [],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
