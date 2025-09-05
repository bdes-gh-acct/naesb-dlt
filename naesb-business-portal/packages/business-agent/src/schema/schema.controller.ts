import { Body, Controller, Post } from '@nestjs/common';
import { ICreateSchemaRequest, SchemaService } from './schema.service';

@Controller('schemas')
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Post('/')
  public async create(@Body() body: ICreateSchemaRequest) {
    this.schemaService.create(body);
  }
}
