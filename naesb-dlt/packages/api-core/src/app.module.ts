import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard, JwtStrategy } from '@shared/server-utils';
import { IdentityModule } from './identity/identity.module';
import { WellKnownModule } from './well-known/well-known.module';
import { DirectoryModule } from './directory/directory.module';
import { WellModule } from './well';
import { FieldModule } from './field';

@Module({
  imports: [
    PassportModule,
    IdentityModule,
    HttpModule,
    ConfigModule.forRoot({ isGlobal: true }),
    WellKnownModule,
    DirectoryModule,
    WellModule,
    FieldModule,
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
