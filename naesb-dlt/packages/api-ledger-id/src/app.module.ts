import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { OrganizationModule } from './organization/organization.module';
import { UserModule } from './user/user.module';
import { OrganizationService } from './organization/organization.service';
import { UserService } from './user/user.service';
import { OrganizationController } from './organization/organization.controller';
import { UserController } from './user/user.controller';
import { JwtStrategy, JwtAuthGuard } from './auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { ServerModule } from './server/server.module';
import { ServerService } from './server/server.service';
import { MspModule } from './msp/msp.module';
import { HealthModule } from './health/health.module';
import { TlsModule } from './tls/tls.module';

@Module({
  imports: [
    PassportModule,
    CacheModule.register({
      isGlobal: true,
    }),
    HealthModule,
    MspModule,
    TlsModule,
  ],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
