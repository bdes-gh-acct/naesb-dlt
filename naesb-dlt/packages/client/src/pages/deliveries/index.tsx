import { Box } from '@mui/material';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { DeliveriesList } from './list';
import { DeliveriesCurrentList } from './list/current';
import { DeliveriesHistoricList } from './list/historic';

export const Deliveries = () => {
  const { path } = useRouteMatch();
  return (
    <Box flexGrow={1} paddingBottom={2}>
      <Switch>
        <Route path={`${path}/`} exact>
          <DeliveriesList />
        </Route>
        <Route path={`${path}/current`}>
          <DeliveriesCurrentList />
        </Route>
        <Route path={`${path}/historic`}>
          <DeliveriesHistoricList />
        </Route>
      </Switch>
    </Box>
  );
};
