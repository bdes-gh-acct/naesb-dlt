/* eslint-disable @typescript-eslint/no-unsafe-return */
import { BadRequestException } from '@nestjs/common';
import { Schema } from 'zod';

const flattenError: any = (
  error: Record<string, string | { _errors: Array<string> }>,
) => {
  if (typeof error === 'object')
    return Object.entries(error).reduce((acc: any, [key, err]) => {
      if (Array.isArray(err)) {
        if (key === '_errors') {
          return err.join(', ');
        }
        return {
          ...acc,
          [key]: err.map((inner) => flattenError(inner)),
        };
      }
      return { ...acc, [key]: flattenError(err) };
    }, {});
  return error;
};

export const validate = async <T extends object>(
  schema: Schema<T>,
  values: T,
): Promise<T> => {
  const result = await schema.safeParseAsync(values);
  if (result.success) {
    return result.data;
  }
  const error = flattenError(result.error.format());
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  throw new Error(JSON.stringify(error));
};

export const apiValidate = async <T extends object, S extends Schema<T>>(
  schema: S,
  values: T,
) => {
  const result = await schema.safeParseAsync(values);
  if (result.success) {
    return result.data;
  }
  const error = flattenError(result.error.format());
  throw new BadRequestException(error);
};
