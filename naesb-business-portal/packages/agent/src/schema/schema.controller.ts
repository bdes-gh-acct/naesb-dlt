import { Controller, Get } from '@nestjs/common';
import { SchemaService } from './schema.service';

@Controller('schemas')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Get('/naesb')
  public async getNaesb() {
    return this.schemaService.getNaesbSchema();
  }
}
