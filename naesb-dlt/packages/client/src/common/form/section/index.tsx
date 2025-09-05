import { Divider, Grid, Stack, Typography } from '@mui/material';
import { FC } from 'react';

export interface FormSectionProps {
  title: string;
}

export const FormDivide: FC<{ title: string }> = ({ title }) => {
  return (
    <>
      <Typography variant="h6" sx={{ marginTop: 1.5 }}>
        {title}
      </Typography>
      <Divider />
    </>
  );
};

export const FormSection: FC<FormSectionProps> = ({ title, children }) => {
  return (
    <>
      <Typography variant="h6">{title}</Typography>
      <Divider sx={{ mb: 2 }} />
      <Grid container spacing={3} sx={{ marginBottom: 2 }}>
        <Grid item sm={6} />
        <Grid item sm={6}>
          <Stack spacing={2}>{children}</Stack>
        </Grid>
      </Grid>
    </>
  );
};
