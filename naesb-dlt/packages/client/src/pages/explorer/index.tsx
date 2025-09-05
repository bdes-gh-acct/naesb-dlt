import { useRouteMatch, Switch, Route, Redirect } from 'react-router-dom';
import { Box } from '@mui/material';
import { Blocks } from './blocks';
import { Transactions } from './transactions';

export const Explorer = () => {
  const { path } = useRouteMatch();
  return (
    <Box flexGrow={1}>
      <Switch>
        <Route path={`${path}/transactions`}>
          <Transactions />
        </Route>
        <Route path={`${path}/blocks`}>
          <Blocks />
        </Route>
        <Redirect from={`${path}`} to={`${path}/blocks`} strict />
      </Switch>
    </Box>
  );
};
