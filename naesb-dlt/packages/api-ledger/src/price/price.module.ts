import { Module } from '@nestjs/common';
import { HttpModule } from '@shared/server-utils';
import { PriceService } from './price.service';

@Module({
  imports: [
    HttpModule.register({
      retries: 5,
    }),
  ],
  providers: [PriceService],
  exports: [PriceService],
})
export class PriceModule {}
