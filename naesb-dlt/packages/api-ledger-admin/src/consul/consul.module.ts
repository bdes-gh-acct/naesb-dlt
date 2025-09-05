import { Module } from '@nestjs/common';
import { HttpModule } from '@shared/server-utils';
import { VaultModule } from 'src/vault/vault.module';
import { ConsulService } from './consul.service';

@Module({
  imports: [
    HttpModule.register({
      retries: 5,
    }),
    VaultModule,
  ],
  providers: [ConsulService],
  exports: [ConsulService],
})
export class ConsulModule {}
