import { DesktopDatePicker, DesktopDatePickerProps } from '@mui/x-date-pickers';
import { TextFieldProps } from '@mui/material';
import { useCallback } from 'react';
import { toUtc, fromUtc } from '@react/toolkit';

export interface BaseDatePickerProps
  extends Omit<DesktopDatePickerProps<Date>, 'onChange' | 'value'> {
  helperText?: string;
  fullWidth?: boolean;
  variant?: TextFieldProps['variant'];
  useUtc?: boolean;
  error?: string;
  label?: string;
  value?: string | null;
  onChange?: DesktopDatePickerProps<string>['onChange'];
  sx?: TextFieldProps['sx'];
}

export const BaseDatePicker = ({
  label,
  onChange: outerOnChange,
  helperText,
  variant,
  fullWidth,
  error,
  useUtc,
  value,
  slotProps,
  ...rest
}: BaseDatePickerProps) => {
  const onChangeCallback = useCallback(
    (date: any, event) => {
      if (outerOnChange) {
        outerOnChange(
          date
            ? useUtc
              ? toUtc(date)?.toISOString()
              : date?.toISOString
            : value,
          event,
        );
      }
    },
    [outerOnChange, value, useUtc],
  );
  return (
    <DesktopDatePicker<Date>
      label={label}
      {...rest}
      value={
        value
          ? useUtc
            ? fromUtc(new Date(value))
            : new Date(value)
          : (value as null)
      }
      onChange={onChangeCallback}
      slotProps={{
        ...(slotProps && slotProps),
        field: {
          // @ts-ignore
          InputLabelProps: { shrink: true },
        },
        textField: {
          ...(slotProps.textField && slotProps.textField),
          helperText: error || helperText,
          error,
          label,
          InputLabelProps: { shrink: true },
          fullWidth,
          variant,
        },
      }}
    />
  );
};
