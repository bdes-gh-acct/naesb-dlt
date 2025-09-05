import { Box, Card, Divider, Grid, Typography } from '@mui/joy';
import { QueryOperator } from '@naesb/dlt-model';
import { useParams } from '@tanstack/router';
import { DisplayText } from 'components/shared/display';
import { useSearchBaseContracts } from 'query/contract';
import { useBusiness, useDirectory } from 'query/directory';

export const BaseContractPage = () => {
  const { businessId } = useParams({ from: '/Businesses/$businessId' });
  const { data: directory } = useBusiness(businessId);
  const { data: directoryList, isLoading: directoryListLoading } =
    useDirectory();
  const { data, isLoading } = useSearchBaseContracts(
    directory?.channel
      ? {
          query: {
            // @ts-ignore
            ChannelId: {
              filter: directory.channel.ChannelId,
              type: QueryOperator.EQUALS,
            },
          },
        }
      : {},
    Boolean(directory?.channel),
  );
  if (directory?.channel?.ChannelId) {
    return (
      <Box py={3}>
        <Card sx={{ paddingBottom: 0, paddingX: 0 }}>
          <Box mb={1} mx={2}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography level="title-md">Basic Info</Typography>
            </Box>
            <Divider sx={{ marginBottom: 1 }} />
            <Grid container spacing={2}>
              <Grid xs={12} md={6} lg={3}>
                <DisplayText
                  label="Initiating Party"
                  field="InitiatingParty"
                  data={data?.data.length ? data.data[0] : undefined}
                  isLoading={isLoading || directoryListLoading}
                  valueFormatter={({ value }) =>
                    directoryList?.data.find(
                      (business) => business.businessId === value,
                    )?.name
                  }
                />
              </Grid>
              <Grid xs={12} md={6} lg={3}>
                <DisplayText
                  label="Receiving Party"
                  field="ReceivingParty"
                  data={data?.data.length ? data.data[0] : undefined}
                  isLoading={isLoading || directoryListLoading}
                  valueFormatter={({ value }) =>
                    directoryList?.data.find(
                      (business) => business.businessId === value,
                    )?.name
                  }
                />
              </Grid>
              <Grid xs={12} md={6} lg={3}>
                <DisplayText
                  label="Revision"
                  field="Revision"
                  data={data?.data.length ? data.data[0] : undefined}
                  isLoading={isLoading}
                />
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Box>
    );
  }
  return <></>;
};
