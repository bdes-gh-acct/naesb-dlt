import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { InvoiceDetails } from './details';

export const Invoices = () => {
  const { path } = useRouteMatch();
  return (
    <Switch>
      <Route path={`${path}/:invoiceId`}>
        <InvoiceDetails />
      </Route>
    </Switch>
  );
};
