import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';
import { APP_GUARD } from '@nestjs/core';
import { HealthController } from './health/health.controller';
import { OrganizationModule } from './organization/organization.module';
import { JwtAuthGuard, JwtStrategy } from './auth';
import { UserOrganizationModule } from './userOrganization/userOrganization.module';
import { TspLocationModule } from './tsp/tspLocation.module';
import { PriceIndexModule } from './priceIndex/priceIndex.module';
import { PriceIndexProviderModule } from './priceIndexProvider/priceIndexProvider.module';
import { FieldModule } from './field';
import { WellModule } from './well';

@Module({
  imports: [
    TerminusModule,
    OrganizationModule,
    UserOrganizationModule,
    TspLocationModule,
    PriceIndexModule,
    PriceIndexModule,
    PriceIndexProviderModule,
    FieldModule,
    WellModule,
  ],
  controllers: [HealthController],
  providers: [
    JwtStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
