export interface IPriceIndexEnum {
  Code: string;
  DisplayName: string;
}

export const PriceIndexes: Array<IPriceIndexEnum> = [
  {
    Code: 'Platts',
    DisplayName: 'Platts',
  },
];

export interface IQueryResult<T> {
  data: Array<T>;
  totalRecords: number;
}

export enum QueryOperator {
  CONTAINS = 'contains',
  NUMERIC_CONTAINS = 'numericContains',
  STARTS_WITH = 'startsWith',
  ENDS_WITH = 'endsWith',
  IN = 'in',
  NOT_IN = 'notIn',
  BETWEEN = 'between',
  MORE_THAN_OR_EQUAL = 'moreThanOrEqual',
  LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
  MORE_THAN = 'moreThan',
  LESS_THAN = 'lessThan',
  EQUALS = 'equals',
  NOT_NULL = 'notNull',
  NOT = 'not',
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

export type QueryDictionary<T> = Partial<Record<keyof T, QueryValue>>;

export interface QueryFactoryParams<T> {
  end?: number;
  query?: QueryDictionary<T> | Array<QueryDictionary<T>>;
  order?: Record<keyof T, 'ASC' | 'DESC'>;
  start?: number;
}
