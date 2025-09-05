import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { queryFactory } from '@shared/orm';
import { PriceIndex } from 'src/db/priceIndex.entity';
import { PriceIndexService } from './priceIndex.service';
import { AppQuery, QueryResultDto } from '../util/middleware';

@ApiTags('Indices')
@Controller('indices')
export class PriceIndexController {
  constructor(private readonly priceIndexService: PriceIndexService) {}

  @Post('search')
  @AppQuery(PriceIndex)
  public async search(@Body() body: any): Promise<QueryResultDto<PriceIndex>> {
    const options = queryFactory<PriceIndex>(body);
    return this.priceIndexService.findMany({
      ...options,
      relations: {
        provider: true,
      },
    });
  }

  @ApiResponse({
    status: 200,
    type: PriceIndex,
  })
  @ApiParam({ name: 'indexId' })
  @Get(':indexId')
  async findOne(
    @Param() { indexId }: { indexId: string },
  ): Promise<PriceIndex> {
    const response = await this.priceIndexService.findOne(indexId);
    if (response) {
      return response;
    }
    throw new NotFoundException();
  }
}
