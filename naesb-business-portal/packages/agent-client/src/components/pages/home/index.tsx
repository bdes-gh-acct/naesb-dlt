import { useAuth0 } from '@auth0/auth0-react';
import { Typography } from '@mui/joy';
import { useNavigate } from '@tanstack/router';
import { Header } from 'components/header';
import { useEffect } from 'react';

export const HomePage = () => {
  const { isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  useEffect(() => {
    if (isAuthenticated) {
      navigate({ to: '/Businesses' });
    }
  }, [isAuthenticated, navigate]);
  return (
    <>
      <Header />
      <Typography>Home</Typography>
    </>
  );
};
