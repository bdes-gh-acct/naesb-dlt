import { useFormState } from 'react-final-form';

export const useDisableSubmit = (enableIfClean?: boolean) => {
  const { dirty, hasValidationErrors, dirtySinceLastSubmit, hasSubmitErrors } =
    useFormState({
      subscription: {
        dirty: true,
        hasValidationErrors: true,
        dirtySinceLastSubmit: true,
        hasSubmitErrors: true,
      },
    });
  return (
    hasValidationErrors ||
    (!dirty && !enableIfClean) ||
    (hasSubmitErrors && !dirtySinceLastSubmit && !enableIfClean)
  );
};
