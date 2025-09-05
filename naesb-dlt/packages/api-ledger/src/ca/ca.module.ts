import { Module } from '@nestjs/common';
import { HttpModule } from '@shared/server-utils';
import { CaService } from './ca.service';

@Module({
  imports: [
    HttpModule.register({
      retries: 5,
    }),
  ],
  providers: [CaService],
  exports: [CaService],
})
export class CaModule {}
