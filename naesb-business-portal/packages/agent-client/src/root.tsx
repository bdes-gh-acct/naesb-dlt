import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Box } from '@mui/joy';
import { Outlet, RootRoute, Route } from '@tanstack/router';
import { Header } from 'components/header';
import { AuthProvider } from 'components/shared/auth/Provider';
import Layout from 'components/shared/Layout';
import { useMyPublicDid } from 'query/dids';
import { useState } from 'react';
import Navigation from 'components/header/Navigation';
import { Authenticating } from 'components/shared/loader';
import { RouteBreadcrumb } from 'components/shared/breadcrumb';

export const RootRouteComponent = () => {
  // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unused-vars

  return (
    <AuthProvider>
      <Authenticating />
      <Outlet />
    </AuthProvider>
  );
};

export const rootRoute = new RootRoute({
  component: RootRouteComponent,
});

const AuthRouteComponent = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  useMyPublicDid();
  return (
    <>
      {drawerOpen && (
        <Layout.SideDrawer onClose={() => setDrawerOpen(false)}>
          <Navigation />
        </Layout.SideDrawer>
      )}
      <Layout.Root
        sx={{
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'minmax(64px, 200px) minmax(450px, 1fr)',
            md: 'minmax(160px, 200px) minmax(600px, 1fr)',
          },
          ...(drawerOpen && {
            height: '100vh',
            overflow: 'hidden',
          }),
        }}
      >
        <Header setDrawerOpen={setDrawerOpen} />
        <Layout.SideNav>
          <Navigation />
        </Layout.SideNav>
        <Layout.Main>
          <Box py={0} px={2}>
            <RouteBreadcrumb />
            <Outlet />
          </Box>
        </Layout.Main>
      </Layout.Root>
    </>
  );
};

export const authRoute = new Route({
  getParentRoute: () => rootRoute,
  id: 'auth',
  component: withAuthenticationRequired(AuthRouteComponent),
});
