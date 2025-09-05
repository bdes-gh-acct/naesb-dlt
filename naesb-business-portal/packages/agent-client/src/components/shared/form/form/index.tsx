import { Box, ButtonProps } from '@mui/joy';
import { AxiosError } from 'axios';
import { PropsWithChildren, ReactNode, useCallback } from 'react';
import {
  FieldValues,
  FormProvider,
  SubmitErrorHandler,
  SubmitHandler,
  useForm,
  UseFormProps,
} from 'react-hook-form';
import { Submit } from './Submit';

export interface FormProps<TFieldValues extends FieldValues, TContext = never>
  extends UseFormProps<TFieldValues, TContext> {
  onSubmit: SubmitHandler<TFieldValues>;
  onSubmitError?: SubmitErrorHandler<TFieldValues>;
  submitLabel?: string;
  readonly?: boolean;
  allowCleanSubmit?: boolean;
  submitActions?: ReactNode;
  submitProps?: ButtonProps;
}

export const Form = <
  TFieldValues extends FieldValues = FieldValues,
  // eslint-disable-next-line prettier/prettier
  TContext = never,
>({
  children,
  onSubmit,
  onSubmitError,
  submitLabel = 'Save',
  readonly,
  allowCleanSubmit,
  submitActions,
  submitProps,
  ...props
}: PropsWithChildren<FormProps<TFieldValues, TContext>>) => {
  const { setError, ...methods } = useForm(props);
  const handleSubmit = useCallback(
    async (data: any, e: any) => {
      if (readonly) {
        return undefined;
      }
      try {
        await onSubmit(data, e);
      } catch (error) {
        if (typeof error === 'object') {
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
    [readonly, onSubmit, setError],
  );
  return (
    // @ts-ignore
    <FormProvider setError={setError} {...methods}>
      <form onSubmit={methods.handleSubmit(handleSubmit, onSubmitError)}>
        {children}
        {!readonly ? (
          <Box
            display="flex"
            justifyContent="flex-end"
            sx={{ '& button:not(:first-of-type)': { marginLeft: 1 } }}
          >
            <Submit {...submitProps} allowCleanSubmit={allowCleanSubmit}>
              {submitLabel}
            </Submit>
            {submitActions}
          </Box>
        ) : undefined}
      </form>
    </FormProvider>
  );
};
