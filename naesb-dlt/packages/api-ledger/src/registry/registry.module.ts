import { Module } from '@nestjs/common';
import { HttpModule } from '@shared/server-utils';
import { RegistryService } from './registry.service';

@Module({
  imports: [HttpModule],
  providers: [RegistryService],
  exports: [RegistryService],
})
export class RegistryModule {}
