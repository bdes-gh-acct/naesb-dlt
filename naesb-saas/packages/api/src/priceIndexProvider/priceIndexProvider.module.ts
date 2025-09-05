import { Module } from '@nestjs/common';
import { AppDbModule } from 'src/db/db.module';
import { PriceIndexProviderController } from './priceIndexProvider.controller';
import { PriceIndexProviderService } from './priceIndexProvider.service';

@Module({
  imports: [AppDbModule],
  controllers: [PriceIndexProviderController],
  providers: [PriceIndexProviderService],
})
export class PriceIndexProviderModule {}
