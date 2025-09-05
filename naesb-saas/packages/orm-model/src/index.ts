export interface IQueryResult<T> {
  data: Array<T>;
  totalRecords: number;
}

export enum QueryOperator {
  BETWEEN = 'between',
  CONTAINS = 'contains',
  EQUALS = 'equals',
  IN = 'in',
  LESS_THAN = 'lessThan',
  LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
  MORE_THAN = 'moreThan',
  MORE_THAN_OR_EQUAL = 'moreThanOrEqual',
  NON_ZERO = 'nonZero',
  NOT = 'not',
  NOT_IN = 'notIn',
  NOT_NULL = 'notNull',
  NULL = 'null',
}

export interface QueryValue {
  type: QueryOperator;
  filter?:
    | string
    | boolean
    | number
    | Date
    | Array<string>
    | Array<number>
    | Array<Date>;
}

export type QueryFilterValue =
  | string
  | number
  | Date
  | Array<string>
  | Array<number>
  | Array<Date>
  | boolean
  | Array<boolean>;

export type Expand<T> = T extends object
  ? T extends infer O
    ? { [K in keyof O]: O[K] }
    : never
  : T;

export type QueryDictionary<T> = Partial<{
  [K in keyof T]:
    | QueryValue
    | { [N in keyof T[K]]: QueryValue | { [D in keyof T[K][N]]: QueryValue } };
}>;

export interface ApiQueryParams<T> {
  end?: number;
  query?: QueryDictionary<T> | Array<QueryDictionary<T>>;
  sortBy?: Record<keyof T, 'ASC' | 'DESC'>;
  start?: number;
}

export interface HistoricApiQueryParams<T> extends ApiQueryParams<T> {
  startDate?: string | Date;
  endDate?: string | Date;
}
