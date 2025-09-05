/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable jsx-a11y/no-noninteractive-element-interactions */
import { Box, Typography } from '@mui/material';
import { useHistory } from 'react-router-dom';
// @ts-ignore
import LogoSrc from '../drop_logo.png';

export const Logo = () => {
  const history = useHistory();
  const navigateHome = () => history.push('/');

  return (
    <Box display="flex" alignItems="center" flexDirection="row" p={1}>
      <img
        src={LogoSrc}
        alt="Logo"
        style={{ height: 38, cursor: 'pointer' }}
        onClick={navigateHome}
      />
      <Typography
        onClick={navigateHome}
        variant="h5"
        sx={{
          cursor: 'pointer',
          marginLeft: 1,
          fontWeight: 400,
        }}
      >
        NAESB
      </Typography>
      <Typography
        onClick={navigateHome}
        variant="h5"
        color="textSecondary"
        sx={{
          fontWeight: 400,
          cursor: 'pointer',
          marginLeft: 0.2,
        }}
      >
        DLT
      </Typography>
    </Box>
  );
};
