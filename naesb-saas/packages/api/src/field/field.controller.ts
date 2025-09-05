import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { IField } from '@shared/model';
import { Request } from 'express';
import { get } from 'lodash';
import { ApiQueryParams, queryFactory } from '@shared/orm';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FieldService } from './field.service';
import { Field } from '../db';
import { AppQuery } from '../util/middleware';

@ApiBearerAuth()
@ApiTags('Wells')
@Controller('Fields')
export class FieldController {
  constructor(private readonly fieldService: FieldService) {}

  @Post('/search')
  @AppQuery(Field)
  public async findMany(@Body() body: ApiQueryParams<Field>) {
    return this.fieldService.findMany(queryFactory<Field>(body));
  }

  @Post('/')
  public async create(@Body() field: IField, @Req() { user }: Request) {
    const mspId = get(
      user,
      'https://naesbdlt.org/org_msp',
    ) as unknown as string;
    return this.fieldService.create({ ...field, businessId: mspId });
  }

  @Get('/:fieldId')
  public async findOne(@Param('fieldId') fieldId: string) {
    const result = await this.fieldService.findOne(fieldId);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
}
