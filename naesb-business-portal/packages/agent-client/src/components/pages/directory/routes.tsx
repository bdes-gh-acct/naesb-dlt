import { Route } from '@tanstack/router';
import { z } from 'zod';
import { endOfMonth, startOfMonth } from 'date-fns';
import Link from 'components/shared/link';
import { useDirectory } from 'query/directory';
import { Skeleton, Typography } from '@mui/joy';
import { authRoute } from '../../../root';
import { ListBusinessesPage } from './List';
import { DirectoryDetails } from './detail';
import { BusinessRelationshipPage } from './detail/connection';
import { BusinessTradesPage } from './detail/trades';
import { InnerTradeDetails } from '../trade/details';
import { TradeDetailsTab } from '../trade/details/Details';
import { TradeDeliveriesGrid } from '../trade/details/Deliveries';
import { TradeHistoryGrid } from '../trade/details/History';
import { Scheduling } from './detail/scheduling';
import { Deliveries } from './detail/deliveries';
import { BaseContractPage } from './detail/contract';

const directoryRoute = new Route({
  getParentRoute: () => authRoute,
  path: 'Businesses',
  meta: {
    // @ts-ignore
    Breadcrumb: () => <Link to="/Businesses">Companies</Link>,
  },
});

const directoryListRoute = new Route({
  getParentRoute: () => directoryRoute,
  path: '/',
  component: ListBusinessesPage,
});

const businessLeafRoute = new Route({
  getParentRoute: () => directoryRoute,
  path: '$businessId',
  meta: {
    // @ts-ignore
    Breadcrumb: ({ params }: { params: { businessId: string } }) => {
      const { data: directory } = useDirectory();
      const business = directory?.data.find(
        (item) => item.businessId === params.businessId,
      );
      return business ? (
        // @ts-ignore
        <Link to="/Businesses/$businessId/Relationship" params={params}>
          {business.name}
        </Link>
      ) : (
        <Typography>
          <Skeleton>Lorem Ipsum</Skeleton>
        </Typography>
      );
    },
  },
});

const businessDetailsRoute = new Route({
  getParentRoute: () => businessLeafRoute,
  id: '/',
  component: DirectoryDetails,
});

const businessRelationshipRoute = new Route({
  getParentRoute: () => businessDetailsRoute,
  path: 'Relationship',
  component: BusinessRelationshipPage,
});

const businessTradesRoute = new Route({
  getParentRoute: () => businessDetailsRoute,
  path: 'Trading',
  component: BusinessTradesPage,
});

const businessSchedulingRoute = new Route({
  getParentRoute: () => businessDetailsRoute,
  path: 'Scheduling',
  component: Scheduling,
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

const businessDeliveriesRoute = new Route({
  getParentRoute: () => businessDetailsRoute,
  path: 'Deliveries',
  component: Deliveries,
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

const businessTradeLeafRoute = new Route({
  getParentRoute: () => businessLeafRoute,
  path: 'Trades',
  meta: {
    // @ts-ignore
    Breadcrumb: ({ params }: { params: { businessId: string } }) => {
      return (
        // @ts-ignore
        <Link to="/Businesses/$businessId/Trading" params={params}>
          Trades
        </Link>
      );
    },
  },
});

const businessTradeRoute = new Route({
  getParentRoute: () => businessTradeLeafRoute,
  path: '$tradeId',
  component: InnerTradeDetails,
});

const businessContractRoute = new Route({
  getParentRoute: () => businessDetailsRoute,
  path: 'Contract',
  component: BaseContractPage,
});

const businessTradeDetailsRoute = new Route({
  getParentRoute: () => businessTradeRoute,
  path: 'Details',
  component: TradeDetailsTab,
});

const businessTradeHistoryRoute = new Route({
  getParentRoute: () => businessTradeRoute,
  path: 'History',
  component: TradeHistoryGrid,
});

const businessTradeDeliveryRoute = new Route({
  getParentRoute: () => businessTradeRoute,
  path: 'Deliveries',
  component: TradeDeliveriesGrid,
});

export const directoryRoutes = directoryRoute.addChildren([
  directoryListRoute,
  businessLeafRoute.addChildren([
    businessDetailsRoute.addChildren([
      businessRelationshipRoute,
      businessTradesRoute,
      businessSchedulingRoute,
      businessDeliveriesRoute,
      businessContractRoute,
    ]),
    businessTradeLeafRoute.addChildren([
      businessTradeRoute.addChildren([
        businessTradeDetailsRoute,
        businessTradeHistoryRoute,
        businessTradeDeliveryRoute,
      ]),
    ]),
  ]),
]);
