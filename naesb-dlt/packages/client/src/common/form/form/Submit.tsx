import { ButtonProps, Button } from '@mui/material';
import { FC } from 'react';
import { useDisableSubmit } from './useDisableSubmit';

export const Submit: FC<ButtonProps> = ({ children, ...rest }) => {
  const disabled = useDisableSubmit();
  return (
    <Button variant="contained" {...rest} type="submit" disabled={disabled}>
      {children}
    </Button>
  );
};
