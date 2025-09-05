import { DesktopDatePicker, DesktopDatePickerProps } from '@mui/x-date-pickers';
import { TextFieldProps } from '@mui/material';
import { useFormField } from '@common/form/useFormField';
import { FC, useCallback } from 'react';
import { toUtc, fromUtc } from '@react/toolkit';

export interface DatePickerProps
  extends Omit<
    DesktopDatePickerProps<any, Date>,
    'value' | 'onChange' | 'renderInput'
  > {
  name: string;
  helperText?: string;
  fullWidth?: boolean;
  onChange?: DesktopDatePickerProps<any, Date>['onChange'];
  variant?: TextFieldProps['variant'];
  useUtc?: boolean;
}

export const DatePicker: FC<DatePickerProps> = ({
  name,
  label,
  inputFormat,
  onChange: outerOnChange,
  helperText,
  fullWidth,
  variant = 'filled',
  useUtc,
  ...rest
}) => {
  const {
    input: { onChange, value, onBlur, onFocus },
    showError,
    error,
  } = useFormField(name);
  const onChangeCallback = useCallback(
    (date: any, event) => {
      // eslint-disable-next-line no-restricted-globals
      if (date instanceof Date && !isNaN(date.getTime())) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          outerOnChange &&
            // @ts-ignore
            outerOnChange(date ? (useUtc ? toUtc(date) : date) : value, event);
          onChange(
            date
              ? useUtc
                ? toUtc(date).toISOString()
                : date.toISOString()
              : value,
          );
        } catch (e) {
          console.error(e);
        }
      } else {
        console.warn('Invalid Date');
      }
    },
    [outerOnChange, onChange, useUtc, value],
  );
  return (
    <DesktopDatePicker
      label={label}
      inputFormat={inputFormat}
      value={
        value
          ? useUtc
            ? fromUtc(new Date(value as string))
            : new Date(value as string)
          : value
      }
      onChange={onChangeCallback}
      {...rest}
      slotProps={{
        field: {
          // @ts-ignore
          InputLabelProps: { shrink: true },
        },
        textField: {
          helperText: (showError ? error : undefined) || helperText,
          error: showError,
          id: name,
          onBlur,
          onFocus,
          label,
          InputLabelProps: { shrink: true },
          fullWidth,
          variant,
        },
      }}
    />
  );
};
