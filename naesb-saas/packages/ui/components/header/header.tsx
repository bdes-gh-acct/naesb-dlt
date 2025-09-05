import { Box, Typography } from '@mui/joy';
import Image from 'next/image';
import { useRouter } from 'next/router';
import NextLink from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { RegisterButton } from './registerbutton';
import Layout from '../layouts';
import { LogInButton } from './loginbutton';
import { LogoutButton } from './logoutButton';
import { NavButton } from './NavButton';

export const Header = () => {
  const { user, isLoading } = useUser();
  const { pathname } = useRouter();

  return (
    <Layout.Header>
      <NextLink href="/" style={{ textDecoration: 'none' }}>
        <Box display="flex" alignItems="center" flexDirection="row" p={1}>
          <Image src="/drop_logo.png" alt="Logo" width={22.52} height={38} />
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
            Gas Directory
          </Typography>
        </Box>
      </NextLink>
      <Box>
        {Boolean(user) && pathname.toLowerCase() !== '/registration' && (
          <>
            <NavButton label="Companies" href="/organizations" />
            <NavButton label="Locations" href="/locations" />
            <NavButton label="Account" href="/account" />
            {(user?.['https://naesbdlt.org/role'] as Array<string>)?.includes(
              'Registry Admin',
            ) && <NavButton label="Admin" href="/admin" />}
          </>
        )}
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5 }}>
        {Boolean(!user && !isLoading) && (
          <>
            <RegisterButton />
            <LogInButton />
          </>
        )}
        {user && (
          <>
            <LogoutButton />
          </>
        )}
      </Box>
    </Layout.Header>
  );
};
