import { useField } from 'react-final-form';

export const useFormField = <T>(name: string) => {
  const { input, meta } = useField<T>(name, {
    subscription: {
      dirtySinceLastSubmit: true,
      error: true,
      submitError: true,
      value: true,
      touched: true,
      pristine: true,
      submitFailed: true,
    },
  });

  const showError =
    ((meta.submitError && !meta.dirtySinceLastSubmit) || meta.error) &&
    (!meta.pristine || meta.submitFailed || meta.dirtySinceLastSubmit);
  const formError = meta.error || meta.submitError;
  return {
    input,
    showError,
    error: typeof formError === 'string' ? formError : undefined,
  };
};
