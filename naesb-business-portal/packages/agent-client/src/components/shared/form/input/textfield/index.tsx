import {
  Input as MuiInput,
  FormControl as MuiFormControl,
  FormLabel as MuiFormLabel,
  FormHelperText as MuiFormHelperText,
  InputProps as MuiInputProps,
  FormControlProps as MuiFormControlProps,
} from '@mui/joy';
import { ChangeEvent, ReactNode } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import HelpIcon from '@mui/icons-material/Help';
import { Tooltip } from 'components/shared/tooltip';

export interface TextFieldProps extends Omit<MuiInputProps, 'value'> {
  name: string;
  label: string;
  helperText?: string;
  required?: MuiFormControlProps['required'];
  help?: ReactNode;
}

export const TextField = ({
  id,
  label,
  required,
  size,
  color,
  name,
  helperText,
  disabled,
  type,
  help,
  ...props
}: TextFieldProps) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const onChange = (evt: ChangeEvent<HTMLInputElement>) => {
          field.onChange({
            target: {
              value:
                type === 'number'
                  ? evt.target.value
                    ? Number(evt.target.value)
                    : undefined
                  : evt.target.value,
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
            <MuiInput
              {...field}
              {...props}
              type={type}
              disabled={disabled}
              onChange={onChange}
              error={Boolean(fieldState.error)}
              slotProps={{
                input: {
                  onWheel: (evt) => {
                    // @ts-ignore
                    evt.target.blur();

                    evt.stopPropagation();

                    setTimeout(() => {
                      // @ts-ignore
                      evt.target.focus();
                    }, 0);
                  },
                },
              }}
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
