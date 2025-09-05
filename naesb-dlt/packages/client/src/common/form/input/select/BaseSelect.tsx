import { MenuItem, TextField, TextFieldProps } from '@mui/material';
import { get } from 'lodash';
import { PropsWithChildren } from 'react';

export interface BaseSelectProps<T extends Record<string, any>>
  extends Omit<TextFieldProps, 'select'> {
  options?: Array<T>;
  labelKey: keyof T;
  valueKey: keyof T;
}

export const BaseSelect = <T extends Record<string, any>>({
  id,
  options,
  valueKey,
  labelKey,
  name,
  variant = 'filled',
  ...rest
}: PropsWithChildren<BaseSelectProps<T>>) => {
  const inputId = id || `${name}-input`;
  return (
    <TextField
      id={inputId}
      {...rest}
      variant={variant}
      InputLabelProps={{
        ...(rest.InputLabelProps || {}),
        htmlFor: inputId,
        // @ts-ignore
        'data-testid': inputId,
        shrink: true,
      }}
      select
    >
      {options?.map((option) => (
        <MenuItem
          key={JSON.stringify(get(option, valueKey) || get(option, labelKey))}
          value={get(option, valueKey)}
        >
          {option[labelKey]}
        </MenuItem>
      ))}
    </TextField>
  );
};
