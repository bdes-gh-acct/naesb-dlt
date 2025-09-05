import {
  Button,
  ToggleButtonGroup,
  ButtonProps,
  ToggleButtonGroupProps as MuiToggleButtonGroupProps,
  SupportedValue,
} from '@mui/joy';
import { ReactNode } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

export interface ToggleButtonGroupProps<TValue extends SupportedValue>
  extends Omit<MuiToggleButtonGroupProps<TValue>, 'value'> {
  buttons: Array<{ content: string | ReactNode; value: string } & ButtonProps>;
  name: string;
}

export const ToggleButtonInput = <TValue extends SupportedValue>({
  buttons,
  name,
  onChange: outerOnChange,
  ...rest
}: ToggleButtonGroupProps<TValue>) => {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        const onChange = (
          evt: React.MouseEvent<HTMLElement>,
          newValue: any,
        ) => {
          field.onChange({
            target: {
              value: newValue,
            },
          });
          if (outerOnChange) {
            outerOnChange(evt, newValue);
          }
        };
        return (
          <ToggleButtonGroup
            {...rest}
            value={field.value}
            onChange={onChange}
            sx={{ width: '100%', marginBottom: '20.5px' }}
          >
            {buttons.map(({ value: innerValue, content, ...restButton }) => (
              <Button
                {...restButton}
                value={innerValue}
                key={innerValue}
                fullWidth
              >
                {content}
              </Button>
            ))}
          </ToggleButtonGroup>
        );
      }}
    />
  );
};
