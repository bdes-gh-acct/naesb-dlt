import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { IWell } from '@shared/model';
import { Request } from 'express';
import { get } from 'lodash';
import { ApiQueryParams, queryFactory } from '@shared/orm';
import { Well } from 'src/db';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { WellService } from './well.service';
import { AppQuery } from '../util/middleware';

@ApiBearerAuth()
@ApiTags('Wells')
@Controller('Wells')
export class WellController {
  constructor(private readonly wellService: WellService) {}

  @Post('/search')
  @AppQuery(Well)
  public async findMany(@Body() body: ApiQueryParams<Well>) {
    return this.wellService.findMany(queryFactory<Well>(body));
  }

  @Post('/')
  public async create(@Body() well: IWell, @Req() { user }: Request) {
    const mspId = get(
      user,
      'https://naesbdlt.org/org_msp',
    ) as unknown as string;
    return this.wellService.create({ ...well, businessId: mspId });
  }

  @Get('/:wellId')
  public async findOne(@Param('wellId') wellId: string) {
    const result = await this.wellService.findOne(wellId);
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
}
