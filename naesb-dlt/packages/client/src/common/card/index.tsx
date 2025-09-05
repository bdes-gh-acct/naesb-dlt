import { FC } from 'react';
import {
  Card as MuiCard,
  CardHeader,
  CardHeaderProps,
  Divider,
} from '@mui/material';

export interface CardProps {
  title: CardHeaderProps['title'];
  action?: CardHeaderProps['action'];
}

export const Card: FC<CardProps> = ({ title, action, children }) => {
  return (
    <>
      <MuiCard
        sx={{
          backgroundColor: 'background.paper',
          marginBottom: '2px',
          borderBottomRightRadius: 0,
          borderBottomLeftRadius: 0,
        }}
      >
        <CardHeader title={title} action={action} />
      </MuiCard>
      <Divider
        sx={{
          marginBottom: '4px',
          marginTop: '4px',
          borderColor: 'primary.main',
          color: 'primary.main',
          backgroundColor: 'primary.main',
          borderWidth: '1px',
        }}
      />
      <MuiCard sx={{ borderTopRightRadius: 0, borderTopLeftRadius: 0 }}>
        {children}
      </MuiCard>
    </>
  );
};
