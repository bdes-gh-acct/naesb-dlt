import { Module } from '@nestjs/common';
import { HttpModule } from '@shared/server-utils';
import { VaultService } from './vault.service';

@Module({
  imports: [
    HttpModule.register({
      retries: 5,
    }),
  ],
  providers: [VaultService],
  exports: [VaultService],
})
export class VaultModule {}
