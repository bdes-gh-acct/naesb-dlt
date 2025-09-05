import { Box } from '@mui/material';
import { InvoiceDetails } from '@pages/invoices/details';
import { TradeDetails } from '@pages/trade/details';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import { ChannelDetails } from './details';
import { ChannelList } from './list';

export const Channels = () => {
  const { path } = useRouteMatch();
  return (
    <Box flexGrow={1} pb={2}>
      <Switch>
        <Route path={`${path}/`} exact>
          <ChannelList />
        </Route>
        <Route path={`${path}/:channelId/trades/:tradeId`}>
          <TradeDetails />
        </Route>
        <Route path={`${path}/:channelId/invoices/:invoiceId`}>
          <InvoiceDetails />
        </Route>
        <Route path={`${path}/:channelId`}>
          <ChannelDetails />
        </Route>
      </Switch>
    </Box>
  );
};
