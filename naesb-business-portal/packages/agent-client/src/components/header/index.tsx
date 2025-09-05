import { Box, IconButton, Typography } from '@mui/joy';
import Layout from 'components/shared/Layout';
import MenuIcon from '@mui/icons-material/Menu';
import { useAuth0 } from '@auth0/auth0-react';
import { LoginButton } from './LoginButton';
import LogoSrc from './drop_logo.png';
import { AccountMenu } from './Profile';

export interface HeaderProps {
  setDrawerOpen?: (open: boolean) => void;
}

export const Header = ({ setDrawerOpen }: HeaderProps) => {
  const { isAuthenticated } = useAuth0();
  return (
    <Layout.Header>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 1.5,
        }}
      >
        {setDrawerOpen && (
          <IconButton
            variant="outlined"
            size="sm"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Box display="flex" alignItems="center" flexDirection="row" p={1}>
          <img
            src={LogoSrc}
            alt="Logo"
            style={{ height: 38, cursor: 'pointer' }}
          />
          <Typography
            level="h4"
            sx={{
              cursor: 'pointer',
              marginLeft: 1,
              fontWeight: 400,
            }}
          >
            NAESB
          </Typography>
          <Typography
            level="h4"
            sx={{
              fontWeight: 300,
              fontFamily: 'Inter',
              cursor: 'pointer',
              marginLeft: 0.4,
              fontSize: '18px',
              color: 'text.secondary',
            }}
          >
            |
          </Typography>
          <Typography
            sx={{
              fontWeight: 400,
              fontSize: 18,
              cursor: 'pointer',
              marginLeft: 0.4,
              color: 'text.secondary',
            }}
          >
            Business Portal
          </Typography>
        </Box>
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
        {isAuthenticated ? <AccountMenu /> : <LoginButton />}
      </Box>
    </Layout.Header>
  );
};
