import { Box } from '@mui/material';
import { Switch, Route, useRouteMatch, Redirect } from 'react-router-dom';
import { UsersList } from '@pages/users/list';
import { UserDetails } from '@pages/users/details';
import { OrganizationBranding } from './branding';
import { OrganizationDetails } from './details/index';

export const Organization = () => {
  const { path } = useRouteMatch();

  return (
    <Box>
      <Switch>
        <Route path={`${path}/details`}>
          <OrganizationDetails />
        </Route>
        <Route path={`${path}/branding`}>
          <OrganizationBranding />
        </Route>
        <Route path={`${path}/users`} exact>
          <UsersList />
        </Route>
        <Route path={`${path}/users/:userId`}>
          <UserDetails />
        </Route>
        <Redirect from={`${path}`} to={`${path}/details`} strict />
      </Switch>
    </Box>
  );
};
