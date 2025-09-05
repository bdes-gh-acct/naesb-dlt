/* eslint-disable no-nested-ternary */
/* eslint-disable @typescript-eslint/naming-convention */
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Grid,
  Skeleton,
  Alert,
  AlertTitle,
  Divider,
} from '@mui/material';
import numeral from 'numeral';
import { useTrade } from '@query/trades';
import { addDays, differenceInDays } from 'date-fns';
import {
  useParams,
  Link as RouterLink,
  Switch,
  Route,
  Redirect,
  useRouteMatch,
} from 'react-router-dom';
import { RouterTabs } from '@common/tabs';
import { PriceTypeCode } from '@naesb/dlt-model';
import { priceFormatter } from '@common/grid';
import { useOrgMsp } from '@common/hooks';
import { TradeHistoryGrid } from './history';
import { Overview } from './overview';
import { Terms } from './terms';
import { Status } from './components/Status';
import { DeliveryPeriod } from './components/DeliveryPeriod';
import { Volume } from './components/Volume';
import { Logo } from './components/Logo';
import { TradeDeliveriesGrid } from './deliveries';

export const TradeDetails = () => {
  const { channelId, tradeId } = useParams<{
    channelId: string;
    tradeId: string;
  }>();
  const { data: trade } = useTrade(channelId, tradeId);
  const { org_msp } = useOrgMsp();
  const effectiveDays = trade
    ? differenceInDays(
        addDays(new Date(trade.DeliveryPeriodEnd), 1),
        new Date(trade.DeliveryPeriodStart),
      )
    : undefined;
  const { path } = useRouteMatch();

  return (
    <Container maxWidth="lg">
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" component={RouterLink} to="/">
          Home
        </Link>{' '}
        <Link
          underline="hover"
          color="inherit"
          component={RouterLink}
          to="/channels"
        >
          Channels
        </Link>{' '}
        <Link
          underline="hover"
          color="inherit"
          component={RouterLink}
          to={`/channels/${channelId}`}
        >
          {channelId}
        </Link>
        <Typography color="text.primary">Trade: {tradeId}</Typography>
      </Breadcrumbs>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={2}
        mb={3}
      >
        <Typography variant="h4">Trade Details</Typography>
      </Box>
      <Box display="flex" alignItems="center">
        <Box mx={1}>
          <Logo trade={trade} />
        </Box>
        <Box mx={1}>
          <Typography variant="h4">
            {trade ? trade.DealId : <Skeleton />}
          </Typography>
          <Box display="flex" alignItems="center">
            {trade ? (
              <>
                <Status trade={trade} />
                <Typography
                  color="textSecondary"
                  sx={{ marginX: 0.75, pb: '2px', fontWeight: 500 }}
                >
                  |
                </Typography>
                <DeliveryPeriod trade={trade} />
              </>
            ) : (
              <Typography>
                <Skeleton width={300} />
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      {Boolean(trade && org_msp === trade.Reviewing) && (
        <Box mt={2}>
          <Alert variant="outlined" severity="info">
            <AlertTitle>Action Required</AlertTitle>
            Please review the trade information and select accept or revise
          </Alert>
        </Box>
      )}
      <Box pb={3} mt={5}>
        <Grid container spacing={3}>
          <Grid item sm={3}>
            <Typography variant="h3">
              {trade ? (
                trade.PriceType !== PriceTypeCode.INDEX ? (
                  `${numeral(
                    ((trade.MaxDailyQuantity || 0) *
                      (trade?.Price || 0) *
                      (effectiveDays || 0)) as number,
                  ).format('($0,0[.]000a)')}`
                ) : (
                  'N/A'
                )
              ) : (
                <Skeleton />
              )}
            </Typography>
            <Typography variant="overline" color="textSecondary">
              Estimated Value
            </Typography>
          </Grid>
          <Grid item sm={3}>
            <Typography variant="h3">
              {trade ? (
                `${effectiveDays as number} ${
                  effectiveDays === 1 ? 'Day' : 'Days'
                }`
              ) : (
                <Skeleton />
              )}
            </Typography>
            <Typography variant="overline" color="textSecondary">
              Duration
            </Typography>
          </Grid>
          <Grid item sm={3}>
            <Volume trade={trade} />
          </Grid>
          <Grid item sm={3}>
            <Typography variant="h3">
              {trade ? (
                priceFormatter({
                  value: trade.PriceType,
                  data: trade,
                } as unknown as string)
              ) : (
                <Skeleton />
              )}
            </Typography>
            <Typography variant="overline" color="textSecondary">
              USD/MMBTU
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <RouterTabs
        tabs={[
          { route: '/overview', label: 'OVERVIEW' },
          { route: '/deliveries', label: 'DELIVERIES' },
          { route: '/history', label: 'HISTORY' },
          { route: '/terms', label: 'TERMS & CONDITIONS' },
        ]}
      />
      <Divider />
      <Box mt={2}>
        <Switch>
          <Route path={`${path}/history`}>
            <TradeHistoryGrid />
          </Route>
          <Route path={`${path}/deliveries`}>
            <TradeDeliveriesGrid />
          </Route>
          <Route path={`${path}/overview`} exact strict>
            <Overview />
          </Route>
          <Route path={`${path}/terms`} exact strict>
            <Terms />
          </Route>
          <Redirect from={`${path}`} to={`${path}/overview`} strict />
        </Switch>
      </Box>
    </Container>
  );
};
