/* eslint-disable react/destructuring-assignment */
import * as React from 'react';
import FormHelperText from '@mui/joy/FormHelperText';
import Input, { InputProps } from '@mui/joy/Input';
import FormControl from '@mui/joy/FormControl';
import FormLabel from '@mui/joy/FormLabel';
import { DatePicker, DatePickerProps } from '@mui/x-date-pickers/DatePicker';
import {
  unstable_useDateField as useDateField,
  UseDateFieldProps,
} from '@mui/x-date-pickers/DateField';
import {
  BaseSingleInputFieldProps,
  DateValidationError,
  FieldSection,
} from '@mui/x-date-pickers';

interface JoyFieldProps extends InputProps {
  label?: React.ReactNode;
  InputProps?: {
    ref?: React.Ref<any>;
    endAdornment?: React.ReactNode;
    startAdornment?: React.ReactNode;
  };
  formControlSx?: InputProps['sx'];
}

type JoyFieldComponent = ((
  props: JoyFieldProps & React.RefAttributes<HTMLDivElement>,
) => JSX.Element) & { propTypes?: any };

const JoyField = React.forwardRef(
  (props: JoyFieldProps, inputRef: React.Ref<HTMLInputElement>) => {
    const {
      disabled,
      id,
      label,
      InputProps: { ref: containerRef, startAdornment, endAdornment } = {},
      formControlSx,
      ...other
    } = props;
    return (
      <FormControl
        disabled={disabled}
        id={id}
        sx={[
          {
            flexGrow: 1,
          },
          ...(Array.isArray(formControlSx) ? formControlSx : [formControlSx]),
        ]}
        ref={containerRef}
      >
        <FormLabel>{label}</FormLabel>
        <Input
          disabled={disabled}
          slotProps={{ input: { ref: inputRef } }}
          startDecorator={startAdornment}
          endDecorator={endAdornment}
          {...other}
        />
        <FormHelperText>
          {/* {fieldState.error?.message || helperText || ' '} */}
        </FormHelperText>
      </FormControl>
    );
  },
) as JoyFieldComponent;

interface JoyDateFieldProps
  extends Omit<
      UseDateFieldProps<Date>,
      'defaultValue' | 'onChange' | 'onError' | 'value' | 'referenceDate'
    >,
    BaseSingleInputFieldProps<
      Date,
      DateValidationError,
      FieldSection,
      DateValidationError
    > {}

export const JoyDateField = (props: JoyDateFieldProps) => {
  const {
    inputRef: externalInputRef,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    slots,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    slotProps,
    ...textFieldProps
  } = props;

  const response = useDateField<Date, typeof textFieldProps>({
    // @ts-ignore
    props: textFieldProps,
    inputRef: externalInputRef,
  });

  return <JoyField {...response} />;
};

export const BaseDatePicker = (props: DatePickerProps<Date>) => {
  return (
    <DatePicker
      {...props}
      // eslint-disable-next-line react/destructuring-assignment
      // @ts-ignore
      slots={{ field: JoyDateField, ...props.slots }}
    />
  );
};
