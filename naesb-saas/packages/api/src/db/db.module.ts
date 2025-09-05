import { TypeOrmModule } from '@nestjs/typeorm';
import { Module } from '@nestjs/common';
import { readFileSync } from 'fs';
import Organization from './organization.entity';
import UserOrganization from './userOrganization.entity';
import TspLocation from './tspLocation.entity';
import { DirectionOfFlow } from './directionOfFlow.entity';
import { LocationTypeIndicator } from './locationTypeIndicator.entity';
import { PriceIndex } from './priceIndex.entity';
import { PriceIndexDate } from './priceIndexDate.entity';
import { PriceIndexProvider } from './priceIndexProvider.entity';
import { BusinessRoleJunction } from './BusinessRoleJunction.entity';
import { BusinessRole } from './BusinessRole.entity';
import Well from './well.entity';
import Field from './field.entity';

export {
  Organization,
  UserOrganization,
  TspLocation,
  LocationTypeIndicator,
  DirectionOfFlow,
  PriceIndex,
  PriceIndexDate,
  PriceIndexProvider,
  Field,
  Well,
};

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: (process.env.APP_DB_TYPE as any) || 'postgres',
      port: Number(process.env.APP_DB_PORT),
      host: process.env.APP_DB_HOST,
      username: process.env.APP_DB_USERNAME,
      password: process.env.APP_DB_PASSWORD,
      database: process.env.APP_DB_DATABASE,
      schema: process.env.APP_DB_SCHEMA,
      entities: [
        Organization,
        UserOrganization,
        TspLocation,
        DirectionOfFlow,
        LocationTypeIndicator,
        PriceIndex,
        PriceIndexDate,
        PriceIndexProvider,
        BusinessRole,
        BusinessRoleJunction,
        Well,
        Field,
      ],
      logging: ['error'],
      synchronize: Boolean(process.env.SYNCHRONIZE_SCHEMA),
      autoLoadEntities: true,
      ssl: process.env.APP_DB_SSL_PATH
        ? {
            ca: readFileSync(process.env.APP_DB_SSL_PATH).toString(),
          }
        : undefined,
    }),
    TypeOrmModule.forFeature([
      Organization,
      UserOrganization,
      TspLocation,
      DirectionOfFlow,
      LocationTypeIndicator,
      PriceIndex,
      PriceIndexDate,
      PriceIndexProvider,
      BusinessRole,
      BusinessRoleJunction,
      Well,
      Field,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class AppDbModule {}
