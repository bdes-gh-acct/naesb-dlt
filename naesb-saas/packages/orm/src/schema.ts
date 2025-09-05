import { QueryOperator } from '@shared/orm-model';
import { z } from 'zod';
import { dateRegex } from './util';

// BETWEEN = 'between',
// CONTAINS = 'contains',
// EQUALS = 'equals',
// IN = 'in',
// LESS_THAN = 'lessThan',
// LESS_THAN_OR_EQUAL = 'lessThanOrEqual',
// MORE_THAN = 'moreThan',
// MORE_THAN_OR_EQUAL = 'moreThanOrEqual',
// NON_ZERO = 'nonZero',
// NOT = 'not',
// NOT_IN = 'notIn',
// NOT_NULL = 'notNull',
//   NULL = 'null',

export const parsedStringSchema = z.string().transform((val) => {
  if (val.match(dateRegex)) return new Date(val);
  if (val.toLowerCase() === 'true') return true;
  if (val.toLowerCase() === 'false') return false;
  return val;
});

export const betweenQueryValueSchema = z.object({
  filter: z
    .array(z.union([z.date(), z.number(), parsedStringSchema]))
    .length(2),
  type: z.literal(QueryOperator.BETWEEN),
});

export const containsQueryValueSchema = z.object({
  filter: z.union([z.string(), z.number()]),
  type: z.literal(QueryOperator.CONTAINS),
});

export const equalsQueryValueSchema = z.object({
  filter: z.union([
    z.date(),
    z.number(),
    z.boolean(),
    z.null(),
    parsedStringSchema,
  ]),
  type: z.literal(QueryOperator.EQUALS),
});

export const inQueryValueSchema = z.object({
  filter: z.array(
    z.union([z.date(), z.number(), z.boolean(), z.null(), parsedStringSchema]),
  ),
  type: z.literal(QueryOperator.IN),
});

export const lessThanQueryValueSchema = z.object({
  filter: z.union([z.date(), z.number(), parsedStringSchema]),
  type: z.literal(QueryOperator.LESS_THAN),
});

export const lessThanOrEqualQueryValueSchema = z.object({
  filter: z.union([z.date(), z.number(), parsedStringSchema]),
  type: z.literal(QueryOperator.LESS_THAN_OR_EQUAL),
});

export const moreThanQueryValueSchema = z.object({
  filter: z.union([z.date(), z.number(), parsedStringSchema]),
  type: z.literal(QueryOperator.MORE_THAN),
});

export const moreThanOrEqualQueryValueSchema = z.object({
  filter: z.union([z.date(), z.number(), parsedStringSchema]),
  type: z.literal(QueryOperator.MORE_THAN_OR_EQUAL),
});

export const nonZeroQueryValueSchema = z.object({
  filter: z.union([z.coerce.boolean(), parsedStringSchema]),
  type: z.literal(QueryOperator.NON_ZERO),
});

export const notQueryValueSchema = z.object({
  filter: z.union([
    z.date(),
    z.number(),
    z.boolean(),
    z.null(),
    parsedStringSchema,
  ]),
  type: z.literal(QueryOperator.NOT),
});

export const notInQueryValueSchema = z.object({
  filter: z.array(
    z.union([z.date(), z.number(), z.boolean(), z.null(), parsedStringSchema]),
  ),
  type: z.literal(QueryOperator.NOT_IN),
});

export const notNullQueryValueSchema = z.object({
  filter: z.union([
    z.date(),
    z.number(),
    z.boolean(),
    z.null(),
    parsedStringSchema,
  ]),
  type: z.literal(QueryOperator.NOT_NULL),
});

export const nullQueryValueSchema = z.object({
  filter: z.union([
    z.date(),
    z.number(),
    z.boolean(),
    z.null(),
    parsedStringSchema,
  ]),
  type: z.literal(QueryOperator.NULL),
});

export const sortSchema = z.union([
  z.enum(['ASC', 'DESC', 'asc', 'desc']),
  z.object({
    direction: z.enum(['ASC', 'DESC', 'asc', 'desc']),
    nulls: z.enum(['FIRST', 'LAST', 'first', 'last']),
  }),
]);

const queryValueSchema = z.union([
  nullQueryValueSchema,
  notNullQueryValueSchema,
  notInQueryValueSchema,
  notQueryValueSchema,
  nonZeroQueryValueSchema,
  moreThanOrEqualQueryValueSchema,
  moreThanQueryValueSchema,
  lessThanOrEqualQueryValueSchema,
  lessThanQueryValueSchema,
  inQueryValueSchema,
  equalsQueryValueSchema,
  containsQueryValueSchema,
]);

type LiteralQueryValue = z.infer<typeof queryValueSchema>;
type Json = LiteralQueryValue | { [key: string]: Json } | Json[];
const whereJsonSchema: z.ZodType<Json> = z.lazy(() =>
  z.union([
    queryValueSchema,
    z.array(whereJsonSchema),
    z.record(whereJsonSchema),
  ]),
);

type LiteralOrderValue = z.infer<typeof sortSchema>;
type SortJson = LiteralOrderValue | { [key: string]: SortJson };
const sortJsonSchema: z.ZodType<SortJson> = z.lazy(() =>
  z.union([sortSchema, z.record(sortJsonSchema)]),
);

const stringWhereJsonSchema = z.preprocess(
  (arg) => {
    try {
      if (typeof arg === 'string') return JSON.parse(arg);
    } catch {
      return arg;
    }
    return arg;
  },
  z
    .record(whereJsonSchema)
    .optional()
    .refine((value) => {
      if (value === undefined) {
        return true;
      }
      return typeof value === 'object';
    }, 'query is not valid JSON'),
);

const stringSortByJsonSchema = z.preprocess(
  (arg) => {
    try {
      if (typeof arg === 'string') return JSON.parse(arg);
    } catch {
      return arg;
    }
    return arg;
  },
  z
    .record(sortJsonSchema)
    .optional()
    .refine((value) => {
      if (value === undefined) {
        return true;
      }
      return typeof value === 'object';
    }, 'sortBy is not valid JSON'),
);

export const queryParamsSchema = z
  .object({
    start: z.coerce.number().min(0).optional(),
    end: z.coerce.number().positive().optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
    sortBy: stringSortByJsonSchema,
    query: stringWhereJsonSchema,
  })
  .refine(
    ({ start, end }) => {
      if (start === undefined || start === null || end === undefined) {
        return true;
      }
      return end > start;
    },
    { path: ['end'], message: 'end must be greater than start' },
  );
