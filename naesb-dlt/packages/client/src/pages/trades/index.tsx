import { Box } from '@mui/material';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { TradesList } from './list';
import { TradesActiveList } from './list/active';
import { TradesHistoricList } from './list/historic';
import { TradesPendingList } from './list/pending';

export const Trades = () => {
  const { path } = useRouteMatch();
  return (
    <Box flexGrow={1} pb={2}>
      <Switch>
        <Route path={`${path}/`} exact>
          <TradesList />
        </Route>

        <Route path={`${path}/active`}>
          <TradesActiveList />
        </Route>

        <Route path={`${path}/pending`}>
          <TradesPendingList />
        </Route>

        <Route path={`${path}/historic`}>
          <TradesHistoricList />
        </Route>
      </Switch>
    </Box>
  );
};
