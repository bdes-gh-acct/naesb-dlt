import { Grid, Skeleton, Typography, Box } from '@mui/joy';
import { IDirectory } from '@naesb/dlt-model';
import { Outlet, useParams } from '@tanstack/router';
import { DisplayText } from 'components/shared/display';
import { Roles } from 'components/shared/roles';
import { RouteTabProps, RouterTabs } from 'components/shared/tabs/RouterTabs';
import { useBusiness } from 'query/directory';
import { useMemo } from 'react';

const buildTabs = (counterparty?: IDirectory) => {
  let tabs: Array<RouteTabProps> = [
    { path: 'Relationship', label: 'Relationship' },
  ];
  // @ts-ignore
  if (counterparty?.channel?.Contracts?.length) {
    tabs.push({ path: 'Contract', label: 'Contract' });
  }
  if (counterparty?.channel) {
    tabs = tabs.concat([
      {
        path: 'Trading',
        label: 'Trades',
      },
      { path: 'Scheduling', label: 'Scheduling' },
      { path: 'Deliveries', label: 'Deliveries' },
      { path: 'Invoices', label: 'Invoices' },
    ]);
  }
  return tabs;
};

export const DirectoryDetails = () => {
  const { businessId } = useParams();
  const { data, isLoading } = useBusiness(businessId);
  const tabs: Array<RouteTabProps> = useMemo(() => {
    // @ts-ignore
    return buildTabs(data);
  }, [data]);
  return (
    <>
      <Box mb={2} display="flex">
        <Typography level="title-lg">
          {data && !isLoading ? data?.name : <Skeleton>Lorem Ipson</Skeleton>}
        </Typography>
        {isLoading ? (
          <Typography level="title-lg" sx={{ marginLeft: 1 }}>
            <Skeleton>Lorum Ipson</Skeleton>
          </Typography>
        ) : (
          <Roles roles={data?.roles} size="md" />
        )}
      </Box>
      <Grid container spacing={2} sx={{ marginBottom: 2 }}>
        <Grid xs={12} sm={6} md={4} lg={3}>
          <DisplayText
            label="Business ID"
            field="businessId"
            data={data}
            isLoading={isLoading}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={3}>
          <DisplayText
            label="FERC ID"
            field="fercCid"
            data={data}
            isLoading={isLoading}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={3}>
          <DisplayText
            label="Company Type"
            field="companyType"
            data={data}
            isLoading={isLoading}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={3}>
          <DisplayText
            label="Tax Number"
            field="taxNumber"
            data={data}
            isLoading={isLoading}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={3}>
          <DisplayText
            label="Tax Number Type"
            field="taxNumberType"
            data={data}
            isLoading={isLoading}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={3}>
          <DisplayText
            label="Jurisdiction"
            field="jurisdiction"
            data={data}
            isLoading={isLoading}
          />
        </Grid>
        <Grid xs={12} sm={6} md={4} lg={3}>
          <DisplayText
            label="Connected"
            field="connection"
            data={data}
            valueFormatter={({ value }) => (value ? 'Yes' : 'No')}
            isLoading={isLoading}
          />
        </Grid>
      </Grid>
      {data?.connection ? <RouterTabs tabs={tabs} /> : <></>}
      <Outlet />
    </>
  );
};
