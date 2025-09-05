import { Divider, Typography } from '@mui/joy';
import { FC } from 'react';

export interface FormSectionProps {
  title: string;
}

export const FormDivide: FC<{ title: string }> = ({ title }) => {
  return (
    <>
      <Typography level="title-sm">{title}</Typography>
      <Divider sx={{ marginBottom: 1 }} />
    </>
  );
};
