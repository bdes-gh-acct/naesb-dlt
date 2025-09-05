import { Button } from '@mui/joy';
import { useFormState } from 'react-hook-form';

export const Submit = () => {
  const { isSubmitting, isValid } = useFormState();
  return (
    <Button type="submit" disabled={isSubmitting || !isValid}>
      Submit
    </Button>
  );
};
