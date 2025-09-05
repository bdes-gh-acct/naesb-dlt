import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { TradeDetails } from './details';

export const Trades = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/:tradeId`}>
        <TradeDetails />
      </Route>
    </Switch>
  );
};
