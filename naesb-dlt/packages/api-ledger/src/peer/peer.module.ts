import { Module } from '@nestjs/common';
import { VaultModule } from '@shared/server-utils';
import { CaModule } from '../ca/ca.module';
import { PeerService } from './peer.service';
import { PeersController } from './peer.controller';
import { LedgerModule } from '../ledger/ledger.module';
import { ChaincodeService } from './chaincode.service';
import { MspService } from './msp.service';
import { DbModule } from '../db/db.module';

@Module({
  imports: [CaModule, VaultModule, LedgerModule, DbModule],
  providers: [PeerService, ChaincodeService, MspService],
  controllers: [PeersController],
  exports: [PeerService, ChaincodeService],
})
export class PeerModule {}
