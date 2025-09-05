import { BadRequestException } from '@nestjs/common';
import { Schema } from 'zod';

const flattenError: any = (
  error: Record<string, string | { _errors: Array<string> }>,
) => {
  if (typeof error === 'object')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Object.entries(error).reduce((acc: any, [key, err]) => {
      if (Array.isArray(err)) {
        if (key === '_errors') {
          return err.join(', ');
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return {
          ...acc,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          [key]: err.map((inner) => flattenError(inner)),
        };
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return { ...acc, [key]: flattenError(err) };
    }, {});
  return error;
};

export const validate = async <T extends object, S extends Schema<T>>(
  schema: S,
  values: T,
): Promise<T> => {
  const result = await schema.safeParseAsync(values);
  if (result.success) {
    return result.data;
  }
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  throw new BadRequestException(flattenError(result.error.format()));
};
