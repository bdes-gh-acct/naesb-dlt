import { AxiosError } from 'axios';
import { PropsWithChildren, useCallback, ReactNode } from 'react';
import {
  FieldValues,
  FormProvider,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
  UseFormProps,
} from 'react-hook-form';
import { Submit } from './Submit';

export interface FormProps<
  TFieldValues extends FieldValues = FieldValues,
  TContext = never,
> extends UseFormProps<TFieldValues, TContext> {
  onSubmit: SubmitHandler<TFieldValues>;
  onSubmitError?: SubmitErrorHandler<TFieldValues>;
}

export const Form = <
  TFieldValues extends FieldValues = FieldValues,
  TContext = never,
>({
  children,
  onSubmit,
  mode = 'onBlur',
  onSubmitError,
  ...props
}: PropsWithChildren<FormProps<TFieldValues, TContext>>) => {
  const { setError, ...methods } = useForm({ ...props, mode });
  const handleSubmit = useCallback(
    async (data: any, e: any) => {
      try {
        await onSubmit(data, e);
      } catch (error) {
        if ((error as AxiosError).response?.data) {
          Object.entries((error as AxiosError<any>).response?.data).forEach(
            ([key, err]) =>
              setError(key as any, {
                message: err as string,
                type: 'API_ERROR',
              }),
          );
        }
      }
      return undefined;
    },
    [setError, onSubmit],
  );
  return (
    <FormProvider setError={setError} {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit, onSubmitError)}>
        <>{children}</>
        <Submit />
      </form>
    </FormProvider>
  );
};
