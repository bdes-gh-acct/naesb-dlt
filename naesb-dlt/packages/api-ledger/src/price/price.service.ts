import { Injectable } from '@nestjs/common';
import { QueryOperator } from '@naesb/dlt-model';
import { HttpService } from '@shared/server-utils';
import { env } from '../env';

const { PRICE_API_URL } = env;

@Injectable()
export class PriceService {
  constructor(private readonly httpService: HttpService) {}

  async getPrices(indexes: Array<string>, dates: Array<string>) {
    const result = await this.httpService.post(
      `${PRICE_API_URL}/prices/search`,
      {
        query: {
          IndexId: {
            filter: indexes,
            type: QueryOperator.IN,
          },
          Date: {
            filter: dates,
            type: QueryOperator.IN,
          },
        },
      },
      {},
    );
    return result.data.data;
  }
}
