import {
  FormControl,
  FormLabel,
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  Option,
  FormHelperText,
} from '@mui/joy';
import { Controller, useFormContext } from 'react-hook-form';
import { get } from 'lodash';

export interface SelectProps<TOption>
  extends Omit<MuiSelectProps<any, any>, 'value'> {
  name: string;
  label: string;
  options: Array<TOption>;
  valueKey: keyof TOption;
  labelKey: keyof TOption;
  required?: boolean;
  helperText?: string;
}

export const Select = <TOption,>({
  name,
  label,
  options,
  valueKey,
  labelKey,
  required,
  disabled,
  helperText,
  ...props
}: SelectProps<TOption>) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({
        field: { onChange, value, ...field },
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

          <MuiSelect
            {...field}
            disabled={disabled || isSubmitting}
            value={value || null}
            onChange={(evt: any, newValue) =>
              onChange({ target: { value: newValue } })
            }
          >
            {options.map((option) => (
              <Option key={get(option, valueKey)} value={get(option, valueKey)}>
                {get(option, labelKey)}
              </Option>
            ))}
          </MuiSelect>
          <FormHelperText>
            {fieldState.error?.message || helperText || ' '}
          </FormHelperText>
        </FormControl>
      )}
    />
  );
};
