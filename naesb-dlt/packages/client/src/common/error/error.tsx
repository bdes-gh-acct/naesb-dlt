import { Typography, Card } from '@mui/material';
import { FC } from 'react';

export const Error: FC<{ message?: string }> = ({ message }) => {
  return (
    <Card>
      <Typography variant="h5" component="h5" pt={2} pb={2} pl={2}>
        {message || 'There was an error please try again'}
      </Typography>
    </Card>
  );
};
