import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { HttpModule } from '@shared/server-utils';
import { CaModule } from '../ca/ca.module';
import { DirectoryController } from './directory.controller';
import { AriesModule } from '../aries/aries.module';
import { LedgerModule } from '../ledger/ledger.module';
import { DirectoryService } from './directory.service';
import { RegistryModule } from '../registry/registry.module';

@Module({
  imports: [
    CacheModule.register(),
    HttpModule,
    CaModule,
    LedgerModule,
    RegistryModule,
    AriesModule,
  ],
  controllers: [DirectoryController],
  providers: [DirectoryService],
})
export class DirectoryModule {}
