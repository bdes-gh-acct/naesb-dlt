import {
  Checkbox as MuiCheckbox,
  FormControl as MuiFormControl,
  FormLabel as MuiFormLabel,
  FormHelperText as MuiFormHelperText,
  CheckboxProps as MuiCheckboxProps,
  FormControlProps as MuiFormControlProps,
} from '@mui/joy';
import { ChangeEvent, ReactNode } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import HelpIcon from '@mui/icons-material/Help';
import { Tooltip } from 'components/shared/tooltip';

export interface CheckboxProps extends Omit<MuiCheckboxProps, 'value'> {
  name: string;
  label: string;
  helperText?: string;
  required?: MuiFormControlProps['required'];
  help?: ReactNode;
}

export const Checkbox = ({
  id,
  label,
  required,
  size,
  color,
  name,
  helperText,
  disabled,
  help,
  ...props
}: CheckboxProps) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, ...field }, fieldState }) => {
        const onChange = (evt: ChangeEvent<HTMLInputElement>) => {
          field.onChange({
            target: {
              value:
                evt.target.value !== undefined && evt?.target.checked !== null
                  ? evt.target.checked
                  : undefined,
            },
          });
        };
        return (
          <MuiFormControl
            id={id}
            required={required}
            size={size}
            disabled={disabled}
            color={color}
            error={Boolean(fieldState.error)}
            sx={{
              '& input:disabled': {
                color: 'text.tertiary',
              },
            }}
            // sx={{ color: disabled ? 'text.secondary' : undefined }}
          >
            <MuiFormLabel
              sx={{ color: disabled ? 'text.tertiary' : undefined }}
            >
              {label}
              {help ? (
                <Tooltip title={help}>
                  <HelpIcon sx={{ fontSize: 18, marginLeft: 1 }} />
                </Tooltip>
              ) : undefined}
            </MuiFormLabel>
            <MuiCheckbox
              {...field}
              {...props}
              checked={value}
              disabled={disabled}
              onChange={onChange}
              name={name}
            />
            <MuiFormHelperText>
              {fieldState.error?.message || helperText || ' '}
            </MuiFormHelperText>
          </MuiFormControl>
        );
      }}
    />
  );
};
