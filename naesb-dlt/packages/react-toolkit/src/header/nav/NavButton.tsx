/* eslint-disable import/no-extraneous-dependencies */
import { Button } from '@mui/material';
import { FC } from 'react';
import { useRouteMatch } from 'react-router';
import { Link } from 'react-router-dom';

export interface NavButtonProps {
  label: string;
  route: string;
}

export const NavButton: FC<NavButtonProps> = ({ label, route }) => {
  const match = useRouteMatch(route);
  return (
    <Button
      component={Link}
      to={route}
      color="inherit"
      sx={{
        fontFamily: 'Goldman, Roboto, sans-serif',
        height: '100%',
        lineHeight: 1.3,
        color: match ? 'text.primary' : 'text.secondary',
        letterSpacing: '0.05em',
      }}
    >
      {label}
    </Button>
  );
};
