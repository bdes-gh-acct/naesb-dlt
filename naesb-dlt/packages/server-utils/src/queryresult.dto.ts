import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiHideProperty,
  ApiOkResponse,
  ApiProperty,
  getSchemaPath,
} from '@nestjs/swagger';
import { IQueryResult } from '@naesb/dlt-model';

export class QueryResultDto<T> implements IQueryResult<T> {
  constructor(data: IQueryResult<T>) {
    Object.assign(this, data);
  }

  @ApiHideProperty()
  data!: Array<T>;

  @ApiProperty({
    description: 'Total number of records that match the search criteria',
    example: 1,
  })
  totalRecords!: number;
}

export const ApiQueryResultDto = <TModel extends Type<any>>(model: TModel) =>
  applyDecorators(
    ApiOkResponse({
      schema: {
        allOf: [
          { $ref: getSchemaPath(QueryResultDto) },
          {
            properties: {
              data: {
                type: 'array',
                description: 'Array of records matching the search criteria',
                items: { $ref: getSchemaPath(model) },
              },
            },
          },
        ],
      },
    }),
  );
