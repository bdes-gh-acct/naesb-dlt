import { Module } from '@nestjs/common';
import { AppDbModule } from '../db';
import { FieldController } from './field.controller';
import { FieldService } from './field.service';

@Module({
  imports: [AppDbModule],
  providers: [FieldService],
  exports: [FieldService],
  controllers: [FieldController],
})
export class FieldModule {}
