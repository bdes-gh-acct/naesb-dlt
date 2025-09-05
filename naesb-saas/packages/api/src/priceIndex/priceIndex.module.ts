import { Module } from '@nestjs/common';
import { AppDbModule } from '../db/db.module';
import { PriceIndexController } from './priceIndex.controller';
import { PriceIndexService } from './priceIndex.service';

@Module({
  imports: [AppDbModule],
  controllers: [PriceIndexController],
  providers: [PriceIndexService],
})
export class PriceIndexModule {}
