import { Route } from '@tanstack/router';
import { z } from 'zod';
import { startOfMonth, endOfMonth } from 'date-fns';
import { authRoute } from '../../../root';
import { InnerTradeDetails } from './details';
import { TradeDetailsTab } from './details/Details';
import { TradeDeliveriesGrid } from './details/Deliveries';
import { TradeHistoryGrid } from './details/History';
import { SearchTrades } from './search';

const tradesRoute = new Route({
  getParentRoute: () => authRoute,
  path: 'Trades',
});

const searchTradesRoute = new Route({
  getParentRoute: () => tradesRoute,
  path: '/',
  component: SearchTrades,
  validateSearch: z.object({
    startDate: z
      .string()
      .datetime()
      .default(startOfMonth(new Date()).toISOString()),
    endDate: z
      .string()
      .datetime()
      .default(endOfMonth(new Date()).toISOString()),
  }),
});

const tradeRoute = new Route({
  getParentRoute: () => tradesRoute,
  path: '$tradeId',
  component: InnerTradeDetails,
});

const tradeDetailsRoute = new Route({
  getParentRoute: () => tradeRoute,
  path: 'Details',
  component: TradeDetailsTab,
});

const tradeHistoryRoute = new Route({
  getParentRoute: () => tradeRoute,
  path: 'History',
  component: TradeHistoryGrid,
});

const tradeDeliveryRoute = new Route({
  getParentRoute: () => tradeRoute,
  path: 'Deliveries',
  component: TradeDeliveriesGrid,
});

export const tradeRoutes = tradesRoute.addChildren([
  searchTradesRoute,
  tradeRoute.addChildren([
    tradeDetailsRoute,
    tradeHistoryRoute,
    tradeDeliveryRoute,
  ]),
]);
