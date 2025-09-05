import { Module } from '@nestjs/common';
import { AgentModule } from '@shared/agent-utils';
import { ConnectionController } from './connection.controller';
import { ConnectionService } from './connection.service';

@Module({
  imports: [AgentModule],
  providers: [ConnectionService],
  controllers: [ConnectionController],
})
export class ConnectionModule {}
