import { Module } from '@nestjs/common';
import { MspController } from './msp.controller';
import { VaultModule } from 'src/vault/vault.module';
import { MspService } from './msp.service';

@Module({
  imports: [VaultModule],
  controllers: [MspController],
  providers: [MspService],
  exports: [MspService],
})
export class MspModule {}
