import { Module } from '@nestjs/common';
import { AgentModule } from '@shared/agent-utils';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [AgentModule],
  providers: [WalletService],
  controllers: [WalletController],
})
export class WalletModule {}
