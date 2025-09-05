import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
} from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express';
import { QueryFactoryParams, IField } from '@naesb/dlt-model';
import { FieldService } from './field.service';

@Controller('Fields')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @Post('/search')
  public async findMany(
    @Req() { headers: { authorization } }: Request,
    @Body() body: QueryFactoryParams<IField>,
  ) {
    console.log('Fields/search');
    return this.fieldService.findMany(authorization as string, body);
  }

  @Post('/')
  public async create(
    @Req() { headers: { authorization } }: Request,
    @Body() field: IField,
  ) {
    console.log('Fields.');
    return this.fieldService.create(authorization as string, field);
  }

  @Get('/:fieldId')
  public async findOne(
    @Req() { headers: { authorization } }: Request,
    @Param('fieldId') fieldId: string,
  ) {
    const result = await this.fieldService.findOne(
      authorization as string,
      fieldId,
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
}
