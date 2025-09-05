/* eslint-disable no-nested-ternary */
import {
  DatePickerProps as MuiDatePickerProps,
  DateValidationError,
} from '@mui/x-date-pickers';
import { InputProps, TextFieldProps } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';
// eslint-disable-next-line import/no-extraneous-dependencies
import { isValid, startOfDay, endOfDay } from 'date-fns';
import { PickerChangeHandlerContext } from '@mui/x-date-pickers/internals/hooks/usePicker/usePickerValue.types';
import { fromUtc, toUtc } from './util';
import { BaseDatePicker } from './BaseDatePicker';

export type DatePickerProps = Omit<
  MuiDatePickerProps<Date>,
  'value' | 'onChange' | 'renderInput'
> & {
  name: string;
  useEndOfDay?: boolean;
  label: string;
  format?: string;
  useUtc?: boolean;
  onChange?: (value: Date | null) => void;
  size?: 'small' | 'medium';
  margin?: TextFieldProps['margin'];
  helperText?: string;
  sx?: TextFieldProps['sx'];
  onBlur?: InputProps['onBlur'];
  onFocus?: InputProps['onFocus'];
  fullWidth?: TextFieldProps['fullWidth'];
};

export const formatDateInUtc = (date?: Date) => {
  if (!date) return undefined;
  return fromUtc(startOfDay(date as Date))?.toISOString();
};

export const DatePicker = ({
  name,
  label,
  useUtc = true,
  useEndOfDay,
  size,
  sx,
  fullWidth,
  margin,
  onChange: outerOnChange,
  helperText,
  ...rest
}: DatePickerProps) => {
  const { control } = useFormContext();
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const onChange = (
          date: Date | null,
          err: PickerChangeHandlerContext<DateValidationError>,
        ) => {
          if ((!err.validationError && isValid(date)) || !date) {
            const dateStamp = date
              ? useEndOfDay
                ? endOfDay(date)
                : startOfDay(date)
              : null;
            const valueFormatted = useUtc
              ? fromUtc(dateStamp as Date)?.toISOString()
              : dateStamp?.toISOString();
            if (outerOnChange) {
              outerOnChange(dateStamp);
            }
            field.onChange({ target: { value: valueFormatted } });
          }
        };
        return (
          <BaseDatePicker
            {...rest}
            value={
              field.value
                ? useUtc
                  ? (toUtc(new Date(field.value)) as Date)
                  : new Date(field.value)
                : undefined
            }
            onChange={onChange}
            label={label}
            slotProps={{
              textField: {
                ...field,
                error: Boolean(fieldState.error),
                helperText: fieldState.error?.message || helperText || ' ',
                id: name,
                onBlur: field.onBlur,
                label,
                sx,
                fullWidth,
                size,
                margin,
              },
            }}
          />
        );
      }}
    />
  );
};
