import { Module } from '@nestjs/common';
import { TspLocationController } from './tspLocation.controller';
import { TspLocationService } from './tspLocation.service';
import { AppDbModule } from '../db';

@Module({
  imports: [AppDbModule],
  controllers: [TspLocationController],
  providers: [TspLocationService],
})
export class TspLocationModule {}
