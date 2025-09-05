import {
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  InputProps,
} from '@mui/joy';
import { Controller, useFormContext } from 'react-hook-form';

export interface TextFieldProps extends Omit<InputProps, 'value'> {
  name: string;
  label: string;
  helperText?: string;
}

export const TextField = ({
  name,
  label,
  disabled,
  required,
  helperText,
  ...props
}: TextFieldProps) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { value, ...field },
        fieldState,
        formState: { isSubmitting },
      }) => (
        <FormControl
          id={name}
          required={required}
          size={props.size}
          color={props.color}
          error={Boolean(fieldState.error)}
        >
          <FormLabel>{label}</FormLabel>

          <>
            <Input
              {...props}
              disabled={disabled || isSubmitting}
              required={required}
              {...field}
              value={value || ''}
            />
            <FormHelperText>
              {fieldState.error?.message || helperText || ' '}
            </FormHelperText>
          </>
        </FormControl>
      )}
    />
  );
};
