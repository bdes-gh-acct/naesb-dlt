import { Module } from '@nestjs/common';
import { AgentModule } from '@shared/agent-utils';
import { SchemaController } from './schema.controller';
import { SchemaService } from './schema.service';

@Module({
  imports: [AgentModule],
  providers: [SchemaService],
  controllers: [SchemaController],
})
export class SchemaModule {}
