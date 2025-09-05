import React, { FC, useEffect } from 'react';
import { useFormField } from '@common/form/useFormField';
import { startOfDay, endOfMonth } from 'date-fns';
import { fromUtc, toUtc } from '@react/toolkit';
import { DatePicker, DatePickerProps } from './Date';

export interface EndOfMonthDatePickerProps extends DatePickerProps {
  startName: string;
}

export const EndOfMonthDatePicker: FC<EndOfMonthDatePickerProps> = ({
  name,
  startName,
  ...rest
}) => {
  const {
    input: { value: startValue },
  } = useFormField(startName);
  const {
    input: { onChange },
  } = useFormField(name);
  useEffect(() => {
    if (startValue) {
      const newValue = toUtc(
        startOfDay(endOfMonth(fromUtc(new Date(startValue as string)))),
      ).toISOString();
      onChange(newValue);
    }
  }, [onChange, startValue]);
  return <DatePicker name={name} {...rest} />;
};
