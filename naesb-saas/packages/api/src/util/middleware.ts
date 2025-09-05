/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable max-classes-per-file */
import {
  applyDecorators,
  CallHandler,
  ExecutionContext,
  HttpCode,
  Injectable,
  NestInterceptor,
  Type,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHideProperty,
  ApiOkResponse,
  getSchemaPath,
} from '@nestjs/swagger';
import { QueryResult } from '@shared/model';
import { queryParamsSchema } from '@shared/orm';
import { Request } from 'express';
import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';
import z from 'zod';
import { validate } from './validate';

export class QueryResultDto<TData> implements QueryResult<TData> {
  totalRecords!: number;

  timestamp!: string;

  @ApiHideProperty()
  data!: TData[];
}

export const validateParams = async (
  params: z.infer<typeof queryParamsSchema>,
) =>
  // @ts-ignore
  validate(queryParamsSchema, params);

@Injectable()
export class QueryInterceptor implements NestInterceptor {
  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request: Request = context.switchToHttp().getRequest();
    const { query, startDate, endDate, sortBy, start, end } =
      request.method === 'GET' ? request.query : request.body;
    const params = await validateParams({
      query,
      startDate,
      endDate,
      sortBy,
      start,
      end,
    });
    request.body = {
      ...params,
      sortBy:
        params.sortBy && !isEmpty(params.sortBy) ? params.sortBy : undefined,
    };
    return next.handle();
  }
}

const baseQueryFields = {
  start: {
    type: 'number',
    description:
      'Pagination argument used to offset a specific number of records',
  },
  end: {
    type: 'number',
    description:
      'Pagination argument used to define the maximum number of records returned',
  },
  sortBy: {
    type: 'object',
    additionalProperties: true,
    description:
      'Sorting argument in JSON format following the standard orderBy syntax described in the technical documentation',
  },
  query: {
    type: 'object',
    additionalProperties: true,
  },
};

const historicQueryFields = {
  startDate: {
    type: 'string',
    format: 'date-time',
  },
  endDate: {
    type: 'string',
    format: 'date-time',
  },
};

export function AppQuery<TModel extends Type<unknown>>(
  type: TModel,
  historicQueryField?: string,
) {
  // eslint-disable-next-line no-nested-ternary
  const decorators = [
    ApiBody({
      required: false,
      schema: {
        allOf: [
          {
            type: 'object',
            properties: {
              ...(historicQueryField
                ? { ...baseQueryFields, ...historicQueryFields }
                : baseQueryFields),
            },
          },
        ],
      },
    }),
  ];

  return applyDecorators(
    UseInterceptors(QueryInterceptor),
    HttpCode(200),
    ...decorators,
    ApiOkResponse({
      schema: {
        allOf: [
          {
            properties: {
              totalRecords: {
                type: 'number',
                description:
                  'Total number of records matching the query defined',
              },
              timestamp: {
                type: 'string',
                description:
                  'Time at which the data was fetched or stored in the cache',
              },
              data: {
                type: 'array',
                items: { $ref: getSchemaPath(type) },
              },
            },
          },
        ],
      },
    }),
  );
}
