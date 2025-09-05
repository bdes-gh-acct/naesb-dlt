/* eslint-disable @typescript-eslint/naming-convention */
import { AppState, Auth0Provider } from '@auth0/auth0-react';
import { useState } from 'react';
import { useHistory } from 'react-router-dom';

export const AuthProvider: React.FC = ({ children }) => {
  const history = useHistory();
  const [org_id] = useState(localStorage.getItem('auth_org_id'));
  const onRedirectCallback = (appState?: AppState) => {
    history.push(appState?.returnTo || window.location.pathname);
  };

  return (
    <Auth0Provider
      domain="naesb.us.auth0.com"
      clientId="SAEmf77iWytn9oC5mDjVipoHujxc2mZR"
      onRedirectCallback={onRedirectCallback}
      authorizationParams={{
        redirect_uri: window.location.origin,
        organization: org_id || undefined,
        audience: 'https://naesb.us.auth0.com/api/v2/',
        scope: 'openid profile email read:users_app_metadata read:users',
      }}
    >
      {children}
    </Auth0Provider>
  );
};
