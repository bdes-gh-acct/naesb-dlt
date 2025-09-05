/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import {
  Autocomplete as MuiAutocomplete,
  AutocompleteProps as MuiAutocompleteProps,
  CircularProgress,
  TextField,
} from '@mui/material';
import { get } from 'lodash';
import { TextFieldProps } from '../TextField';
import { useFormField } from '../../useFormField';

export interface AutocompleteProps<
  T extends Record<string, any>,
  Multiple extends boolean,
> extends Omit<
    MuiAutocompleteProps<T, Multiple, any, any>,
    'value' | 'renderInput' | 'options'
  > {
  /**
   * key to be used to select label value.  By default the component will set label = value[labelKey]
   */
  labelKey: string;
  /**
   * label for the input
   */
  label?: TextFieldProps['label'];
  autoFocus?: TextFieldProps['autoFocus'];
  helperText?: TextFieldProps['helperText'];
  variant?: TextFieldProps['variant'];
  color?: TextFieldProps['color'];
  style?: TextFieldProps['style'];
  /**
   * key to be used to select value.  By default the component will set value = value[valueKey]
   */
  valueKey: string;
  /**
   * When options are loaded asynchronously, setting isLoading will display loading indicator
   */
  isLoading?: boolean;
  limitTags?: number;
  options?: Array<T>;
  name: string;
  size?: 'small' | 'medium';
  margin?: TextFieldProps['margin'];
  multiple?: Multiple;
}

const filterValue = <T,>(
  value: any,
  valueKey: string,
  options?: Array<T>,
  multiple?: boolean,
) =>
  multiple
    ? options?.filter(
        (item: any) => value && value.includes(get(item, valueKey)),
      )
    : options?.find((item: any) => value && value === get(item, valueKey));
export const Autocomplete = <
  T extends Record<string, any>,
  Multiple extends boolean,
>({
  labelKey,
  label,
  variant,
  valueKey,
  isLoading,
  options,
  multiple,
  onChange: outerOnChange,
  name,
  style,
  size,
  autoFocus,
  helperText,
  color,
  ...rest
}: PropsWithChildren<AutocompleteProps<T, Multiple>>) => {
  const {
    input: { onChange, value },
    showError,
    error,
  } = useFormField<any>(name);
  const [internalValue, setInternalValue] = useState(
    filterValue(value, valueKey, options, multiple),
  );
  useEffect(() => {
    setInternalValue(filterValue(value, valueKey, options, multiple));
  }, [value, options, valueKey, multiple]);

  const handleChange = useCallback(
    (_: React.ChangeEvent<any>, val: any, reason: any, details: any) => {
      if (multiple) {
        onChange(val ? val.map((item: any) => get(item, valueKey)) : []);
      } else {
        onChange(val ? get(val, valueKey) : undefined);
      }
      if (outerOnChange) {
        outerOnChange(_, val, reason, details);
      }
    },
    [onChange, valueKey, multiple, outerOnChange],
  );
  return (
    <MuiAutocomplete
      getOptionLabel={(option: T) => get(option, labelKey)}
      {...rest}
      isOptionEqualToValue={(option: T, innerValue: T) =>
        get(option, valueKey) === get(innerValue, valueKey)
      }
      options={options || []}
      loading={isLoading}
      multiple={multiple}
      onChange={handleChange}
      size={size || rest.margin === 'dense' ? 'small' : undefined}
      value={(internalValue || (multiple ? [] : null)) as any}
      renderInput={({ InputLabelProps = {}, InputProps = {}, ...params }) => (
        <TextField
          {...params}
          variant={variant}
          style={style}
          autoFocus={autoFocus}
          color={color}
          label={label}
          error={showError}
          helperText={(showError ? error : undefined) || helperText}
          InputLabelProps={{
            ...InputLabelProps,
            shrink: true,
          }}
          InputProps={{
            ...InputProps,
            endAdornment: (
              <>
                {isLoading ? (
                  <CircularProgress
                    color="inherit"
                    size={20}
                    data-testid={`${name}-autocomplete-loading-indicator`}
                  />
                ) : null}
                {InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
    />
  );
};
