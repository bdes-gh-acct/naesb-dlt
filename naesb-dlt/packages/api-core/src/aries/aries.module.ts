import { Module } from '@nestjs/common';
import { HttpModule } from '@shared/server-utils';
import { AriesService } from './aries.service';

@Module({
  imports: [
    HttpModule.register({
      retries: 5,
    }),
  ],
  providers: [AriesService],
  exports: [AriesService],
})
export class AriesModule {}
