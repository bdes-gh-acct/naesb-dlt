import { ComponentType, PropsWithChildren } from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { withAuthenticationRequired } from '@auth0/auth0-react';
import { Loading } from '@common/loading/Loading';

export interface ProtectedRouteProps {
  component: ComponentType;
}

const RedirectLoading = () => <Loading />;

export const ProtectedRoute = ({
  component,
  ...args
}: PropsWithChildren<ProtectedRouteProps & RouteProps>) => (
  <Route
    component={withAuthenticationRequired(component, {
      onRedirecting: RedirectLoading,
    })}
    {...args}
  />
);
