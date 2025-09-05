/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { PropsWithChildren, useMemo } from 'react';
import {
  Autocomplete as MuiAutocomplete,
  FormHelperText as MuiFormHelperText,
  CircularProgress,
  FormLabel,
  FormControl,
} from '@mui/joy';
// eslint-disable-next-line import/no-extraneous-dependencies
import { get } from 'lodash';
import {
  Controller,
  // @ts-ignore
  useFormContext,
  ControllerRenderProps,
  ControllerFieldState,
  FieldValues,
} from 'react-hook-form';
import { AutocompleteProps } from './types';
import { useAutocomplete } from './useAutocomplete';
import { ListboxComponent } from './VirtualizedList';

export const InnerAutocomplete = <
  T extends Record<string, any>,
  Multiple extends boolean,
  DisableClearable extends boolean,
  FreeSolo extends boolean,
>({
  labelKey,
  label,
  valueKey,
  isLoading,
  options,
  multiple,
  onChange: outerOnChange,
  size,
  slots,
  helperText,
  fieldState,
  field: { value, ...field },
  virtualize,
  ...rest
}: PropsWithChildren<
  AutocompleteProps<T, Multiple, DisableClearable, FreeSolo> & {
    field: ControllerRenderProps<FieldValues>;
    fieldState: ControllerFieldState;
    virtualize?: boolean;
  }
>) => {
  const { onChange, value: internalValue } = useAutocomplete(
    { value, ...field },
    valueKey,
    multiple,
    options,
    outerOnChange,
  );
  const innerSlots = useMemo(
    () =>
      virtualize
        ? { ...(slots || {}), listbox: ListboxComponent }
        : { ...(slots || {}) },
    [slots, virtualize],
  );
  return (
    <FormControl>
      <FormLabel>{label}</FormLabel>
      <MuiAutocomplete
        getOptionLabel={(option) => {
          return get(option, labelKey);
        }}
        disableCloseOnSelect={multiple}
        {...rest}
        {...field}
        slots={innerSlots}
        options={options || []}
        loading={isLoading}
        multiple={multiple}
        onChange={onChange}
        size={size}
        value={(internalValue || (multiple ? [] : null)) as any}
        endDecorator={
          isLoading ? (
            <CircularProgress
              size="sm"
              sx={{ bgcolor: 'background.surface' }}
            />
          ) : null
        }
      />
      <MuiFormHelperText>
        {fieldState.error?.message || helperText || ' '}
      </MuiFormHelperText>
    </FormControl>
  );
};

export const Autocomplete = <
  T extends Record<string, any>,
  Multiple extends boolean,
  DisableClearable extends boolean = false,
  FreeSolo extends boolean = false,
>({
  name,
  ...props
}: AutocompleteProps<T, Multiple, DisableClearable, FreeSolo> & {
  virtualize?: boolean;
}) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <InnerAutocomplete
          name={name}
          {...props}
          field={field}
          fieldState={fieldState}
        />
      )}
    />
  );
};
