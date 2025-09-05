/* eslint-disable @typescript-eslint/ban-ts-comment */
import {
  QueryOperator,
  QueryDictionary,
  QueryValue,
  QueryFilterValue,
  HistoricApiQueryParams,
} from '@shared/orm-model';
import { isEmpty, isNil, set } from 'lodash';
import {
  Between,
  Equal,
  FindOptionsWhere,
  FindManyOptions,
  In,
  IsNull,
  Not,
  MoreThanOrEqual,
  Raw,
  MoreThan,
  LessThan,
  LessThanOrEqual,
} from 'typeorm';
import { cleanse } from './util';

// if a filter value is stringified, convert it to Javascript Date or boolean value
const parseFilterValue = (filter: QueryFilterValue): QueryFilterValue => {
  if (typeof filter === 'string') {
    if (
      filter.match(
        /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2}(?:\.\d*)?)((-(\d{2}):(\d{2})|Z)?)$/,
      )
    ) {
      return new Date(filter);
    }
    if (filter === 'true' || filter === 'false') {
      return filter === 'true';
    }
  }
  return filter;
};

// If the date is an array of ISO date strings, convert all them to Javascript Date.
const transformFilter = (
  filter?: QueryFilterValue,
): QueryFilterValue | undefined => {
  if (isNil(filter)) return undefined;
  if (Array.isArray(filter)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return filter.map(parseFilterValue) as QueryFilterValue;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return parseFilterValue(filter);
};

export const getType = (
  filterType: QueryOperator,
  filter: QueryFilterValue | undefined,
) => {
  const transformedFilter = transformFilter(filter);

  switch (filterType) {
    case QueryOperator.CONTAINS:
      return Raw((alias: string) => `UPPER(${alias}) LIKE UPPER(:filter)`, {
        filter: `%${transformedFilter}%`,
      });
    case QueryOperator.MORE_THAN_OR_EQUAL:
      return MoreThanOrEqual(transformedFilter);
    case QueryOperator.NON_ZERO:
      return Raw((alias: string) =>
        transformedFilter
          ? `(${alias} IS NOT NULL AND ${alias} <> 0)`
          : `(${alias} IS NULL OR ${alias} = 0)`,
      );
    case QueryOperator.MORE_THAN:
      return MoreThan(transformedFilter);
    case QueryOperator.LESS_THAN:
      return LessThan(transformedFilter);
    case QueryOperator.LESS_THAN_OR_EQUAL:
      return LessThanOrEqual(transformedFilter);
    case QueryOperator.BETWEEN:
      return Between(
        (transformedFilter as Array<string | number | Date>)[0],
        (transformedFilter as Array<string | number | Date>)[1],
      );
    case QueryOperator.IN:
      return In(transformedFilter as Array<string | number>);
    case QueryOperator.NOT:
      return Not(transformedFilter);
    case QueryOperator.NOT_IN:
      return Not(In(transformedFilter as Array<string | number>));
    case QueryOperator.NOT_NULL:
      return transformedFilter !== false ? Not(IsNull()) : IsNull();
    case QueryOperator.NULL:
      return transformedFilter !== false ? IsNull() : Not(IsNull());
    case QueryOperator.EQUALS:
      return Equal(transformedFilter);
    default:
      throw new Error('SQL comparison not implemented');
  }
};

const buildDateFilter = (startDate?: Date, endDate?: Date) => {
  if (startDate && endDate) {
    return Between(startDate, endDate);
  }
  if (startDate) {
    return MoreThanOrEqual(startDate);
  }
  if (endDate) return LessThanOrEqual(endDate);
  return undefined;
};

export const reduceFilter = <T>(
  query?: QueryDictionary<T>,
): FindOptionsWhere<T> | undefined => {
  const search =
    query && Object.entries(query).length
      ? Object.entries(query).reduce(
          (acc: FindOptionsWhere<T>, [key, value]) => {
            if (value && typeof value === 'object') {
              const { type, filter } = value as QueryValue;
              if (
                type &&
                typeof type === 'string' &&
                Object.values(QueryOperator).includes(type)
              ) {
                return {
                  ...acc,
                  [key]: getType(type, filter),
                };
              }
            }
            const reduced = reduceFilter<T[keyof T]>(
              value as QueryDictionary<T[keyof T]>,
            );
            return Object.keys(reduced || {}).length
              ? { ...acc, [key]: reduced }
              : acc;
          },
          {} as FindOptionsWhere<T>,
        )
      : undefined;

  return search;
};

const decorateFilterWithDates = <T>(
  {
    startDate,
    endDate,
    dateField,
  }: { startDate?: Date; endDate?: Date; dateField?: string },
  query?: FindOptionsWhere<T>,
): FindOptionsWhere<T> => {
  let where = query;
  if (dateField && (startDate || endDate)) {
    const dateFilter = buildDateFilter(startDate, endDate);
    if (dateFilter) {
      where = query || {};
      set(where, dateField, dateFilter);
    }
  }
  return where as FindOptionsWhere<T>;
};

export const buildFindOptionsWhere = <T>(
  query?: QueryDictionary<T> | Array<QueryDictionary<T>>,
  startDate?: Date,
  endDate?: Date,
  dateField?: string,
): FindOptionsWhere<T>[] | FindOptionsWhere<T> | undefined => {
  const inputFilter =
    query && Array.isArray(query)
      ? query.map((q) => reduceFilter<T>(q))
      : reduceFilter(query);
  return inputFilter && Array.isArray(inputFilter)
    ? inputFilter.map((q) =>
        decorateFilterWithDates<T>({ startDate, endDate, dateField }, q),
      )
    : decorateFilterWithDates({ startDate, endDate, dateField }, inputFilter);
};

export const getTake = (start?: number, end?: number) => {
  if (start && end) return end - start + 1;
  if (end) return end;
  return undefined;
};

// Converts from API Query Model to TypeORM Find Many Options
export const queryFactory = <T extends object>(
  { end, query, sortBy, start, startDate, endDate }: HistoricApiQueryParams<T>,
  dateField?: keyof T,
): FindManyOptions<T> =>
  cleanse<FindManyOptions<T>>({
    where:
      query || startDate || endDate
        ? buildFindOptionsWhere(
            query,
            startDate && typeof startDate === 'string'
              ? new Date(startDate)
              : (startDate as Date | undefined),
            endDate && typeof endDate === 'string'
              ? new Date(endDate)
              : (endDate as Date | undefined),
            dateField as string,
          )
        : undefined,
    take: getTake(start, end),
    skip: start && Number(start) ? start : undefined,
    // @ts-ignore
    order: sortBy && !isEmpty(sortBy) && sortBy !== '{}' ? sortBy : undefined,
  });
