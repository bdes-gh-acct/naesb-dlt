import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { CaModule } from '../ca/ca.module';
import { WellKnownController } from './well-known.controller';

@Module({
  imports: [CacheModule.register(), HttpModule, CaModule],
  controllers: [WellKnownController],
})
export class WellKnownModule {}
