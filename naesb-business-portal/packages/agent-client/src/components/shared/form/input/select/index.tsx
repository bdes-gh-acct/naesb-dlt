import {
  FormControl,
  FormLabel,
  Select as MuiSelect,
  SelectProps as MuiSelectProps,
  Option,
  FormHelperText,
  Tooltip,
} from '@mui/joy';
import HelpIcon from '@mui/icons-material/Help';
import { Controller, useFormContext } from 'react-hook-form';
import { get } from 'lodash';
import { ReactNode } from 'react';

export interface SelectProps<TOption>
  extends Omit<MuiSelectProps<any>, 'value'> {
  name: string;
  label: string;
  options: Array<TOption>;
  valueKey: keyof TOption;
  labelKey: keyof TOption;
  required?: boolean;
  helperText?: string;
  help?: ReactNode;
}

export const Select = <TOption,>({
  name,
  label,
  options,
  valueKey,
  labelKey,
  required,
  helperText,
  help,
  ...props
}: SelectProps<TOption>) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, ...field }, fieldState }) => (
        <FormControl
          id={name}
          required={required}
          size={props.size}
          color={props.color}
          error={Boolean(fieldState.error)}
        >
          <FormLabel>
            {label}
            {help ? (
              <Tooltip title={help}>
                <HelpIcon sx={{ fontSize: 18, marginLeft: 1 }} />
              </Tooltip>
            ) : undefined}
          </FormLabel>

          <MuiSelect
            {...field}
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
