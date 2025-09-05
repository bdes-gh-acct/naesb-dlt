import {
  ToggleButton,
  ToggleButtonGroup,
  ToggleButtonProps,
  ToggleButtonGroupProps as MuiToggleButtonGroupProps,
} from '@mui/material';
import { ReactNode, FC, useCallback } from 'react';
import { useFormField } from '../useFormField';

export interface ToggleButtonGroupProps
  extends Omit<MuiToggleButtonGroupProps, 'value'> {
  buttons: Array<
    { content: string | ReactNode; value: string } & ToggleButtonProps
  >;
  name: string;
}

export const ToggleButtonInput: FC<ToggleButtonGroupProps> = ({
  buttons,
  name,
  onChange: outerOnChange,
  ...rest
}) => {
  const {
    input: { onChange, value },
  } = useFormField(name);
  const handleChange = useCallback(
    (event, formValue) => {
      onChange(formValue);
      if (outerOnChange) {
        outerOnChange(event, formValue);
      }
    },
    [onChange, outerOnChange],
  );

  return (
    <ToggleButtonGroup {...rest} value={value} onChange={handleChange}>
      {buttons.map(({ value: innerValue, content, ...restButton }) => (
        <ToggleButton {...restButton} value={innerValue} key={innerValue}>
          {content}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  );
};
