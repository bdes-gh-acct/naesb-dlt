import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ApiQueryParams, queryFactory } from '@shared/orm';
import { AppQuery } from 'src/util/middleware';
import { TspLocation } from '../db';
import { TspLocationService } from './tspLocation.service';

@ApiTags('Locations')
@Controller('locations')
export class TspLocationController {
  constructor(private readonly tspLocationService: TspLocationService) {}

  @Post('/search')
  @AppQuery(TspLocation)
  public async search(@Body() body: ApiQueryParams<TspLocation>) {
    const options = queryFactory<TspLocation>(body);
    return this.tspLocationService.findMany({
      ...options,
      relations: {
        organization: true,
        directionOfFlowCode: true,
        typeIndicatorCode: true,
      },
    });
  }

  @ApiResponse({
    status: 200,
    type: TspLocation,
  })
  @ApiParam({ name: 'locationId' })
  @Get('/:locationId')
  async findOne(
    @Param() { locationId }: { locationId: string },
  ): Promise<TspLocation> {
    const response = await this.tspLocationService.findOne(locationId);
    if (response) {
      return response;
    }
    throw new NotFoundException();
  }
}
