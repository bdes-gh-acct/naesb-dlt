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
import { IWell, QueryFactoryParams } from '@naesb/dlt-model';
import { WellService } from './well.service';

@Controller('Wells')
export class WellController {
  constructor(private readonly wellService: WellService) {}

  @Post('/search')
  public async findMany(
    @Req() { headers: { authorization } }: Request,
    @Body() body: QueryFactoryParams<IWell>,
  ) {
    return this.wellService.findMany(authorization as string, body);
  }

  @Post('/')
  public async create(
    @Req() { headers: { authorization } }: Request,
    @Body() field: IWell,
  ) {
    return this.wellService.create(authorization as string, field);
  }

  @Get('/:wellId')
  public async findOne(
    @Req() { headers: { authorization } }: Request,
    @Param('wellId') wellId: string,
  ) {
    const result = await this.wellService.findOne(
      authorization as string,
      wellId,
    );
    if (!result) {
      throw new NotFoundException();
    }
    return result;
  }
}
