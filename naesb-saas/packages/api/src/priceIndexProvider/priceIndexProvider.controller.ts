import {
  Body,
  Controller,
  Get,
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
import { PriceIndexProvider } from 'src/db/priceIndexProvider.entity';
import { PriceIndexProviderService } from './priceIndexProvider.service';
import { AppQuery, QueryResultDto } from '../util/middleware';

@ApiTags('Providers')
@Controller('providers')
@ApiExtraModels(QueryResultDto, PriceIndexProvider)
export class PriceIndexProviderController {
  constructor(private readonly providerService: PriceIndexProviderService) {}

  @Post('search')
  @AppQuery(PriceIndexProvider)
  public async search(
    @Body() body: any,
  ): Promise<QueryResultDto<PriceIndexProvider>> {
    return this.providerService.findMany(queryFactory(body));
  }

  @ApiResponse({
    status: 200,
    type: PriceIndexProvider,
  })
  @ApiParam({ name: 'providerId' })
  @Get(':providerId')
  async findOne(@Param() { providerId }: any): Promise<PriceIndexProvider> {
    const response = await this.providerService.findOne(providerId);
    if (response) {
      return response;
    }
    throw new NotFoundException();
  }
}
