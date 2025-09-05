import { Box, Grid, Skeleton, Typography } from '@mui/joy';
import { ITradeViewModel, PriceTypeCode } from '@naesb/dlt-model';
import numeral from 'numeral';
import { Outlet, useParams } from '@tanstack/router';
import { DisplayText } from 'components/shared/display';
import { formatStatus } from 'components/shared/table/formatters';
import { useTrade } from 'query/trade';
import { useOrgMsp } from 'utils/auth';
import { useCallback } from 'react';
import { useDirectory } from 'query/directory';
import { RouteTabProps, RouterTabs } from 'components/shared/tabs/RouterTabs';
import { ReplyTrade } from './Reply';

const tabs: Array<RouteTabProps> = [
  { path: 'Details', label: 'Basic Info' },
  { path: 'Deliveries', label: 'Deliveries' },
  { path: 'History', label: 'History' },
];

const statusValueFormatter = ({ value }: { value?: string }) =>
  value ? formatStatus(value) : undefined;

const estimatedValueValueFormatter = ({
  data,
}: {
  value?: any;
  data: ITradeViewModel;
}) =>
  data.PriceType !== PriceTypeCode.INDEX
    ? `${numeral(
        ((data.MaxDailyQuantity || 0) *
          (data?.Price || 0) *
          (data.Duration || 0)) as number,
      ).format('($0,0[.]000a)')}`
    : 'N/A';

export const InnerTradeDetails = () => {
  const { tradeId } = useParams();
  const { data } = useTrade(tradeId);
  const { mspId } = useOrgMsp();
  const { data: directory } = useDirectory();
  const counterpartyValueFormatter = useCallback(
    ({ data: innerData }: { data: ITradeViewModel }) => {
      const counterparty =
        innerData.Type === 'Buy' ? innerData.BuyerParty : innerData.SellerParty;
      const company = directory?.data.find(
        (item) => item.businessId === counterparty,
      );
      return company?.name || counterparty;
    },
    [directory],
  );
  return (
    <>
      <Typography level="title-lg">
        {data ? (
          `Trade: ${data.OrgDealId || 'Undefined'}`
        ) : (
          <Skeleton>Lorem Ipson</Skeleton>
        )}
      </Typography>
      <Typography
        sx={{ marginBottom: 1, lineHeight: 1.2 }}
        level="body-md"
        textColor="text.secondary"
      >
        Global Deal ID: {tradeId}
      </Typography>
      {/* eslint-disable-next-line no-extra-boolean-cast */}
      {Boolean(data && mspId === data.Reviewing) && (
        <Box my={2}>
          <ReplyTrade trade={data as ITradeViewModel} />
        </Box>
      )}
      <Box my={2}>
        <Grid container spacing={2}>
          <Grid xs={12} sm={6} md={3}>
            <DisplayText data={data} field="Type" label="Type" />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <DisplayText
              data={data}
              field="CounterpartyId"
              label="Counterparty"
              valueFormatter={counterpartyValueFormatter}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <DisplayText
              data={data}
              field="Status"
              label="Status"
              valueFormatter={statusValueFormatter}
            />
          </Grid>
          <Grid xs={12} sm={6} md={3}>
            <DisplayText
              data={data}
              field="Duration"
              label="Est. Value"
              valueFormatter={estimatedValueValueFormatter}
            />
          </Grid>
        </Grid>
      </Box>
      <RouterTabs tabs={tabs} />
      <Outlet />
    </>
  );
};
