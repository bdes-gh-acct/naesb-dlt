import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { Box } from '@mui/material';
import { UserDetails } from './details';
import { UsersList } from './list';

export const Users = () => {
  const { path } = useRouteMatch();
  return (
    <Box>
      <Switch>
        <Route path={`${path}/`} exact>
          <UsersList />
        </Route>
        <Route path={`${path}/:userId`}>
          <UserDetails />
        </Route>
      </Switch>
    </Box>
  );
};
