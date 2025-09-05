import { PageContainer } from '@common/page';
import { RouterTabs } from '@common/tabs';
import { Box, Divider } from '@mui/material';
import { toUtc } from '@react/toolkit';
import { useState } from 'react';
import { addDays, addYears, endOfDay, startOfDay } from 'date-fns';

import {
  Redirect,
  Route,
  Switch,
  useParams,
  useRouteMatch,
} from 'react-router-dom';
import { Activity } from './Activity';
import { TradesGrid } from './Trades';
import { InvoiceList } from './InvoiceList';

export const ChannelDetails = () => {
  const [startDate, setStartDate] = useState<string | undefined>(
    toUtc(startOfDay(addYears(new Date(), -3))).toISOString(),
  );
  const [endDate, setEndDate] = useState<string | undefined>(
    toUtc(endOfDay(addDays(new Date(), 30))).toISOString(),
  );
  const { channelId } = useParams<any>();
  const { path } = useRouteMatch();

  return (
    <PageContainer title={channelId} size={false}>
      <RouterTabs
        tabs={[
          { route: '/trades', label: 'TRADE' },
          { route: '/schedule', label: 'SCHEDULE' },
          { route: '/invoice', label: 'INVOICE' },
        ]}
      />
      <Divider />
      <Box mt={2} height="100%" display="flex" flexDirection="column" pb={2}>
        <Switch>
          <Route path={`${path}/trades`}>
            <TradesGrid
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </Route>
          <Route path={`${path}/schedule`} exact strict>
            <Activity
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </Route>
          <Route path={`${path}/invoice`} exact strict>
            <InvoiceList
              startDate={startDate}
              endDate={endDate}
              setStartDate={setStartDate}
              setEndDate={setEndDate}
            />
          </Route>
          <Redirect from={`${path}`} to={`${path}/trades`} strict />
        </Switch>
      </Box>
    </PageContainer>
  );
};
