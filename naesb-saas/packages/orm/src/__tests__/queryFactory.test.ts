/* eslint-disable @typescript-eslint/ban-ts-comment */
import { QueryOperator } from '@shared/orm-model';
import {
  Between,
  Equal,
  In,
  IsNull,
  Not,
  MoreThanOrEqual,
  MoreThan,
  LessThan,
  LessThanOrEqual,
} from 'typeorm';
import { buildFindOptionsWhere, getType, reduceFilter } from '../queryFactory';

describe('getType', () => {
  it.each([
    // {
    //   type: QueryOperator.CONTAINS,
    //   filter: 'EZ',
    //   result: Raw((alias) => `UPPER(TO_CHAR(${alias})) LIKE UPPER(:filter)`, {
    //     filter: `%EZ%`,
    //   }),
    // },
    // TODO: Add case for numeric contains.  Equality wasn't working with this test pattern
    {
      filter: 19,
      type: QueryOperator.MORE_THAN_OR_EQUAL,
      result: MoreThanOrEqual(19),
    },
    {
      filter: 19,
      type: QueryOperator.MORE_THAN,
      result: MoreThan(19),
    },
    {
      filter: 19,
      type: QueryOperator.LESS_THAN,
      result: LessThan(19),
    },
    {
      filter: 19,
      type: QueryOperator.LESS_THAN_OR_EQUAL,
      result: LessThanOrEqual(19),
    },
    {
      filter: [11, 21],
      type: QueryOperator.BETWEEN,
      result: Between(11, 21),
    },
    {
      filter: [11, 21],
      type: QueryOperator.IN,
      result: In([11, 21]),
    },
    {
      filter: 11,
      type: QueryOperator.NOT,
      result: Not(11),
    },
    {
      filter: [11, 21],
      type: QueryOperator.NOT_IN,
      result: Not(In([11, 21])),
    },
    {
      filter: [11, 21],
      type: QueryOperator.NOT_NULL,
      result: Not(IsNull()),
    },
    {
      filter: [11, 21],
      type: QueryOperator.NULL,
      result: IsNull(),
    },
  ])(
    'should parse',
    ({
      type,
      filter,
      result,
    }: {
      type?: QueryOperator;
      filter: any;
      result: any;
    }) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      const response = getType(type as QueryOperator, filter);
      expect(response).toEqual(result);
    },
  );
});

describe('reduceFilter', () => {
  it('should reduce 1st level', () => {
    const result = reduceFilter({
      PRIMARY: { type: QueryOperator.EQUALS, filter: 'Hi' },
    });
    expect(result?.PRIMARY).toEqual(Equal('Hi'));
  });

  it('should reduce complex', () => {
    const result = reduceFilter<any>({
      EVENT_TYPE: {
        IS_OUTAGE: { type: QueryOperator.EQUALS, filter: true },
        LEVEL: {
          type: QueryOperator.EQUALS,
          filter: 'Testing',
        },
      },
      SERVICE_CENTER: {
        DOC: {
          filter: 'EDOC',
          type: QueryOperator.EQUALS,
        },
      },
      IS_ROLLED_UP: { type: QueryOperator.EQUALS, filter: false },
      AGENCY: { AGENCY_NAME: { type: QueryOperator.EQUALS, filter: 'OMS' } },
    });
    expect(result?.IS_ROLLED_UP).toEqual(Equal(false));
  });

  it('should reduce nested', () => {
    const result = reduceFilter({
      PRIMARY: { type: QueryOperator.EQUALS, filter: 'Hi' },
      // @ts-ignore
      NESTED: { SECONDARY: { type: QueryOperator.EQUALS, filter: 'Bye' } },
    });
    expect(result?.PRIMARY).toEqual(Equal('Hi'));
    // @ts-ignore
    expect(result?.NESTED?.SECONDARY).toEqual(Equal('Bye'));
  });

  it('should reduce empty', () => {
    const result = reduceFilter({});
    expect(result).toBeUndefined();
  });
});

describe('buildFilter', () => {
  it('should build for object', () => {
    const result = buildFindOptionsWhere({
      PRIMARY: { type: QueryOperator.EQUALS, filter: 'Hi' },
    });
    // @ts-ignore
    expect(result?.PRIMARY).toEqual(Equal('Hi'));
  });

  it('should build for array', () => {
    const result = buildFindOptionsWhere([
      {
        PRIMARY: { type: QueryOperator.EQUALS, filter: 'Hi' },
      },
      {
        // @ts-ignore
        SECONDARY: { type: QueryOperator.EQUALS, filter: 'Hi' },
      },
    ]);
    // @ts-ignore
    expect(result[0].PRIMARY).toEqual(Equal('Hi'));
    // @ts-ignore
    expect(result[1].SECONDARY).toEqual(Equal('Hi'));
  });
});
