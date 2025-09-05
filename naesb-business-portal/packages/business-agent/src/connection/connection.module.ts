import { Module } from '@nestjs/common';
import { AgentModule, DbModule, BrokerModule } from '@shared/agent-utils';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';

@Module({
  imports: [AgentModule, DbModule, BrokerModule],
  providers: [ConnectionService],
  controllers: [ConnectionController],
})
export class ConnectionModule {}
