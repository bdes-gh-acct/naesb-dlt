import {
  QueryOperator,
  QueryFactoryParams,
  QueryDictionary,
} from '@naesb/dlt-model';
import {
  Between,
  Equal,
  FindManyOptions,
  In,
  IsNull,
  Not,
  ILike,
  MoreThanOrEqual,
  LessThanOrEqual,
  MoreThan,
  LessThan,
  ObjectLiteral,
  Raw,
  FindOptionsRelations,
  FindOptionsWhere,
} from 'typeorm';

const getType = (
  filterType: QueryOperator,
  filter: string | number | Date | Array<string> | Array<number> | Array<Date>,
) => {
  switch (filterType) {
    case QueryOperator.CONTAINS:
      return ILike(`%${filter}%`);
    case QueryOperator.NUMERIC_CONTAINS:
      return Raw((alias) => `CAST(${alias} as varchar) ILIKE :filter`, {
        filter: `%${filter}%`,
      });
    case QueryOperator.STARTS_WITH:
      return ILike(`${filter}%`);
    case QueryOperator.ENDS_WITH:
      return ILike(`%${filter}`);
    case QueryOperator.MORE_THAN_OR_EQUAL:
      return MoreThanOrEqual(filter);
    case QueryOperator.LESS_THAN_OR_EQUAL:
      return LessThanOrEqual(filter);
    case QueryOperator.MORE_THAN:
      return MoreThan(filter);
    case QueryOperator.LESS_THAN:
      return LessThan(filter);
    case QueryOperator.BETWEEN:
      return Between(
        (filter as Array<string | number | Date>)[0],
        (filter as Array<string | number | Date>)[1],
      );
    case QueryOperator.IN:
      return In(filter as Array<string | number>);
    case QueryOperator.NOT:
      return Not(filter);
    case QueryOperator.NOT_IN:
      return Not(In(filter as Array<string | number>));
    case QueryOperator.NOT_NULL:
      return Not(IsNull());
    default:
      return Equal(filter);
  }
};

const reduceFilter = <T>(query?: QueryDictionary<T>): any | undefined =>
  query && Object.keys(query).length
    ? Object.keys(query).reduce((acc: any, key) => {
        // @ts-ignore
        const { type, filter } = query[key];
        if (
          type &&
          typeof type === 'string' &&
          Object.values(QueryOperator).includes(type as QueryOperator)
        ) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return {
            ...acc,
            [key]: getType(type as QueryOperator, filter),
          };
        }
        return {
          ...acc,
          [key]: reduceFilter((query as Record<string, any>)[key]),
        } as QueryDictionary<T>;
      }, {} as any)
    : undefined;

export const buildFilter = <T>(
  query?: QueryDictionary<T> | Array<QueryDictionary<T>>,
):
  | FindOptionsWhere<T>[]
  | FindOptionsWhere<T>
  | ObjectLiteral
  | string
  | undefined =>
  query && Array.isArray(query)
    ? query.map((q) => reduceFilter(q))
    : reduceFilter(query);

const cleanse = (obj: Record<string, any>) => {
  // eslint-disable-next-line no-param-reassign
  Object.keys(obj).forEach((key) =>
    // eslint-disable-next-line no-param-reassign
    obj[key] === undefined ? delete obj[key] : {},
  );
  return obj;
};

export const queryFactory = <T>(
  { end, query, order, start }: QueryFactoryParams<T>,
  relations?: FindOptionsRelations<T>,
): FindManyOptions<T> =>
  cleanse({
    where: query ? buildFilter(query) : undefined,
    take:
      start !== undefined && end !== undefined
        ? end - start + 1
        : end && !start
        ? end
        : undefined,
    skip: start,
    order,
    relations,
  });
