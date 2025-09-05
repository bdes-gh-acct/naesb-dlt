import { FC, useCallback } from 'react';
import {
  TextField as MuiTextField,
  BaseTextFieldProps as MuiTextFieldProps,
  InputProps,
} from '@mui/material';
import { useFormField } from '../useFormField';

export interface TextFieldProps extends MuiTextFieldProps {
  variant?: 'standard' | 'outlined' | 'filled';
  /**
   * field to be used in the form
   */
  name: string;
  onChange?: InputProps['onChange'];
  onFocus?: InputProps['onFocus'];
  onBlur?: InputProps['onBlur'];
  inputProps?: InputProps['inputProps'];
  InputProps?: InputProps;
}

export const TextField: FC<TextFieldProps> = ({
  name,
  helperText,
  id,
  onChange: outerOnChange,
  variant = 'filled',
  ...props
}) => {
  const {
    input: { onChange, value, onBlur, onFocus },
    showError,
    error,
  } = useFormField(name);
  const onChangeCallback = useCallback(
    (event: any) => {
      if (outerOnChange) {
        outerOnChange(event);
      }
      const val = event.target.value ? event.target.value : undefined;
      onChange(val && props.type === 'number' ? Number(val) : val);
    },
    [outerOnChange, onChange, props.type],
  );
  const inputId = id || `${name}-input`;
  return (
    <MuiTextField
      {...props}
      id={inputId}
      value={value}
      onBlur={onBlur}
      onFocus={onFocus}
      variant={variant}
      onChange={onChangeCallback}
      error={showError}
      helperText={(showError ? error : undefined) || helperText}
      InputLabelProps={{
        ...(props.InputLabelProps || {}),
        htmlFor: inputId,
        shrink: true,
      }}
    />
  );
};
