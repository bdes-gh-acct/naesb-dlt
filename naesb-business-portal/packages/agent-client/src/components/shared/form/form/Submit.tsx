import { Button, ButtonProps } from '@mui/joy';
import { baseContractSchema } from 'components/shared/contract/schema';
import { ReactNode, useEffect } from 'react';
import { useForm, useFormState, useWatch } from 'react-hook-form';

export const Submit = ({
  children = 'Save',
  allowCleanSubmit,
  disabled,
  ...rest
}: ButtonProps & {
  children: ReactNode;
  allowCleanSubmit?: boolean;
}) => {
  const { isSubmitting, isValid, isDirty, errors, defaultValues } =
    useFormState();
  const values = useWatch();
  const form = useForm();
  useEffect(() => {
    const result = baseContractSchema.safeParse(values);
    if (!result.success) {
      console.log(result.error);
    }
  }, [defaultValues, errors, form, values]);
  return (
    <Button
      {...rest}
      type="submit"
      loading={isSubmitting}
      disabled={disabled || !isValid || (!isDirty && !allowCleanSubmit)}
    >
      {children}
    </Button>
  );
};
