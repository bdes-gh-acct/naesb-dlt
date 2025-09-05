import { LoaderClient } from '@tanstack/react-loaders';
import { Route, Router } from '@tanstack/router';
import { CredentialDefinitionPage } from 'components/pages/issuer/credentialDefinitions';
import { HomePage } from 'components/pages/home';
import { WellsPage } from 'components/pages/infrastructure/wells';
import { FieldsPage } from 'components/pages/infrastructure/fields';
import { SchemasPage } from 'components/pages/issuer/schemas';
import { IssuedCredentialsPage } from 'components/pages/issuer/credentials';
import { CertificatesPage } from 'components/pages/infrastructure/certificates';
import { DeliveriesPage } from 'components/pages/deliveries/search';
import { directoryRoutes } from 'components/pages/directory/routes';
import { tradeRoutes } from 'components/pages/trade/routes';
import { authRoute, rootRoute } from './root';

const homeRoute = new Route({
  getParentRoute: () => rootRoute,
  path: '/',
  component: HomePage,
});

const deliveryRoute = new Route({
  getParentRoute: () => authRoute,
  path: 'Deliveries',
});

const searchDeliveriesRoute = new Route({
  getParentRoute: () => deliveryRoute,
  path: '/',
  component: DeliveriesPage,
});

const infrastructureRoute = new Route({
  getParentRoute: () => authRoute,
  path: 'Infrastructure',
});

const wellsRoute = new Route({
  getParentRoute: () => infrastructureRoute,
  path: 'Wells',
  component: WellsPage,
});

const certificatesRoute = new Route({
  getParentRoute: () => infrastructureRoute,
  path: 'Certificates',
  component: CertificatesPage,
});

const fieldsRoute = new Route({
  getParentRoute: () => infrastructureRoute,
  path: 'Fields',
  component: FieldsPage,
});

const issuerRoute = new Route({
  getParentRoute: () => authRoute,
  path: 'Issuer',
});

const credentialDefinitionsRoute = new Route({
  getParentRoute: () => issuerRoute,
  path: 'Credential-Definitions',
  component: CredentialDefinitionPage,
});

const schemasRoute = new Route({
  getParentRoute: () => issuerRoute,
  path: 'schemas',
  component: SchemasPage,
});

const issuedCredentialsRoute = new Route({
  getParentRoute: () => issuerRoute,
  path: 'credentials',
  component: IssuedCredentialsPage,
});

export const routeTree = rootRoute.addChildren([
  homeRoute,
  authRoute.addChildren([
    directoryRoutes,
    deliveryRoute.addChildren([searchDeliveriesRoute]),
    tradeRoutes,
    issuerRoute.addChildren([
      credentialDefinitionsRoute,
      schemasRoute,
      issuedCredentialsRoute,
    ]),
    infrastructureRoute.addChildren([
      wellsRoute,
      fieldsRoute,
      certificatesRoute,
    ]),
  ]),
]);

const router = new Router({ routeTree });

declare module '@tanstack/router' {
  interface RegisterRouter {
    router: typeof router;
  }
}

const loaderClient = new LoaderClient({
  getLoaders: () => [],
});

// Register things for typesafety
declare module '@tanstack/react-loaders' {
  interface Register {
    loaderClient: typeof loaderClient;
  }
}

export { router };
