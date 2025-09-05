import { Module } from '@nestjs/common';
import { AgentModule, DbModule } from '@shared/agent-utils';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';

@Module({
  imports: [AgentModule, DbModule],
  providers: [CertificateService],
  controllers: [CertificateController],
})
export class CertificateModule {}
