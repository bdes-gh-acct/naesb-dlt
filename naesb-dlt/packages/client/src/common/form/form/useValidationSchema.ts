import { AnySchema, ValidationError } from 'yup';
import { AnyObject, setIn, ValidationErrors } from 'final-form';
import { useCallback } from 'react';

export const buildValidateCallback =
  <T>(schema?: AnySchema, context?: any) =>
  // eslint-disable-next-line @typescript-eslint/ban-types
  async (values: T): Promise<ValidationErrors | {}> => {
    if (!schema) return {};
    try {
      await schema.validate(values, { abortEarly: false, context });
    } catch (err) {
      const errors = (err as ValidationError).inner.reduce(
        (formError, innerError) => {
          return typeof innerError.path === 'string' &&
            innerError.path.includes('[')
            ? {
                ...formError,
                [innerError.path?.toString()]: innerError.message,
              }
            : setIn(
                formError as AnyObject,
                innerError.path as string,
                innerError.message,
              );
        },
        {} as ValidationErrors,
      );
      return errors;
    }
    return {};
  };

export const useValidationSchema = <T>(schema?: AnySchema, context?: any) => {
  return useCallback(
    (values: any) => buildValidateCallback<T>(schema, context)(values),
    [schema, context],
  );
};
