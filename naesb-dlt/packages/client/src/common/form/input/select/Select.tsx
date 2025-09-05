import React, { useCallback, PropsWithChildren } from 'react';
import { useFormField } from '../../useFormField';
import { BaseSelect, BaseSelectProps } from './BaseSelect';

export interface SelectProps<T extends Record<string, any>>
  extends BaseSelectProps<T> {
  name: string;
}

export const Select = <T extends Record<string, any>>({
  name,
  label,
  onChange: outerOnChange,
  helperText,
  ...props
}: PropsWithChildren<SelectProps<T>>) => {
  const {
    input: { onChange, value },
    showError,
    error,
  } = useFormField(name);
  const onChangeCallback = useCallback(
    (event: any) => {
      if (outerOnChange) {
        outerOnChange(event);
      }
      onChange(event.target.value);
    },
    [outerOnChange, onChange],
  );
  return (
    <BaseSelect
      label={label}
      name={name}
      value={value}
      {...props}
      onChange={onChangeCallback}
      error={showError}
      helperText={(showError ? error : undefined) || helperText}
    />
  );
};
