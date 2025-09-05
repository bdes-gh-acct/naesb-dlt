import { Module } from '@nestjs/common';
import { FieldModule } from 'src/field';
import { AppDbModule } from '../db';
import { WellController } from './well.controller';
import { WellService } from './well.service';

@Module({
  imports: [AppDbModule, FieldModule],
  providers: [WellService],
  exports: [WellService],
  controllers: [WellController],
})
export class WellModule {}
