/* eslint-disable @typescript-eslint/naming-convention */
import { AppState, Auth0Provider } from '@auth0/auth0-react';
import { ReactNode } from 'react';
import { useNavigate } from '@tanstack/router';
import { useProfile } from 'query/profile';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const onRedirectCallback = (appState?: AppState) => {
    // @ts-ignore
    navigate({ to: appState?.returnTo || window.location.pathname });
  };
  const { data } = useProfile();

  if (!data) return <></>;
  return (
    <Auth0Provider
      domain="naesb.us.auth0.com"
      clientId="SAEmf77iWytn9oC5mDjVipoHujxc2mZR"
      onRedirectCallback={onRedirectCallback}
      authorizationParams={{
        redirect_uri: window.location.origin,
        organization: data.businessId,
        audience: 'https://naesb.us.auth0.com/api/v2/',
        scope: 'openid profile email read:users_app_metadata read:users',
      }}
    >
      {children}
    </Auth0Provider>
  );
};
