import { Module } from '@nestjs/common';
import { TlsController } from './tls.controller';
import { VaultModule } from 'src/vault/vault.module';
import { TlsService } from './tls.service';

@Module({
  imports: [VaultModule],
  controllers: [TlsController],
  providers: [TlsService],
  exports: [TlsService],
})
export class TlsModule {}
