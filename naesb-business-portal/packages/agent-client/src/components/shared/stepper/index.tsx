import { Box } from '@mui/joy';
import { Step, StepProps } from './Step';

export interface StepperProps {
  items: Array<StepProps>;
  value?: string | number;
}

export const Stepper = ({ items, value }: StepperProps) => {
  return (
    <Box display="flex">
      {items.map((item, index) => (
        <Step
          {...item}
          key={item.value}
          itemIndex={index}
          active={value === item.value}
        />
      ))}
    </Box>
  );
};
