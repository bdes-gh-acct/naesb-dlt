import {
  ChannelOrganizationLookup,
  DatePicker,
  Form,
  Select,
  TextField,
} from '@common/form';
import { DisplayController } from '@common/form/displayController';
import { TspLocationLookup } from '@common/form/input/tspLocationLookup';
import { Box, Grid, Stack, Typography } from '@mui/material';
import { useTrade, useUpdateTrade } from '@query/trades';
import {
  PerformanceTypeCode,
  PerformanceTypes,
  PriceTypeCode,
  PriceTypes,
} from '@naesb/dlt-model';
import { FC, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { Outcomes } from './Outcomes';

export const Overview: FC = () => {
  const { channelId, tradeId } = useParams<any>();
  const { mutateAsync } = useUpdateTrade(channelId, tradeId);
  const { data: trade } = useTrade(channelId, tradeId);
  const submit = useCallback(
    async (vals: any) => {
      try {
        await mutateAsync(vals);
      } catch (e) {
        return e;
      }
      return undefined;
    },
    [mutateAsync],
  );
  return (
    <Form initialValues={trade} onSubmit={submit}>
      <Grid container spacing={3}>
        <Grid item sm={6}>
          <Typography variant="h5">BASIC INFO</Typography>
        </Grid>
        <Grid item sm={6}>
          <Stack spacing={2}>
            <TextField
              name="DealId"
              label="GAS DEAL NUMBER"
              disabled
              fullWidth
            />
            <TextField
              name="BaseContractNumber"
              type="number"
              label="BASE CONTRACT NUMBER"
              disabled
              fullWidth
            />
            <TspLocationLookup
              name="DeliveryLocation"
              label="DELIVERY LOCATION"
              tspNumberKey="TspBusinessId"
              disabled
            />
          </Stack>
        </Grid>
        <Grid item sm={6}>
          <Typography variant="h5">DELIVERY PERIOD</Typography>
        </Grid>
        <Grid item sm={6}>
          <Stack spacing={2}>
            <DatePicker
              name="DeliveryPeriodStart"
              label="BEGIN"
              disabled
              fullWidth
              useUtc
            />
            <DatePicker
              name="DeliveryPeriodEnd"
              label="END"
              disabled
              fullWidth
              useUtc
            />
          </Stack>
        </Grid>
        <Grid item sm={6}>
          <Typography variant="h5">BUYER</Typography>
        </Grid>
        <Grid item sm={6}>
          <Stack spacing={2}>
            <ChannelOrganizationLookup
              name="BuyerParty"
              label="BUYER ORGANIZATION"
              channelId={channelId}
              fullWidth
              disabled
            />
            <TextField
              name="BuyerDealId"
              label="BUYER DEAL ID"
              fullWidth
              disabled
            />
          </Stack>
        </Grid>
        <Grid item sm={6}>
          <Typography variant="h5">SELLER</Typography>
        </Grid>
        <Grid item sm={6}>
          <Stack spacing={2}>
            <ChannelOrganizationLookup
              name="SellerParty"
              label="SELLER ORGANIZATION"
              channelId={channelId}
              fullWidth
              disabled
            />
            <TextField
              name="SellerDealId"
              label="SELLER DEAL ID"
              fullWidth
              disabled
            />
          </Stack>
        </Grid>
        <Grid item sm={6}>
          <Typography variant="h5">PRICING</Typography>
        </Grid>
        <Grid item sm={6}>
          <Stack spacing={2}>
            <Select
              options={PriceTypes}
              labelKey="DisplayName"
              valueKey="Code"
              name="PriceType"
              label="PRICE TYPE"
              disabled
              fullWidth
            />
            <DisplayController
              show={({ values }) => values?.PriceType === PriceTypeCode.FIXED}
            >
              <TextField name="Price" label="PRICE (USD)" fullWidth disabled />
            </DisplayController>
            <DisplayController
              show={({ values }) => values?.PriceType === PriceTypeCode.INDEX}
            >
              <TextField name="PriceIndex" label="INDEX" fullWidth disabled />
              <TextField
                name="PriceIndexDifferential"
                label="PRICE MODIFIER (USD)"
                type="number"
                fullWidth
                disabled
              />
            </DisplayController>
          </Stack>
        </Grid>
        <Grid item sm={6}>
          <Typography variant="h5">
            PERFORMANCE OBLIGATION & CONTRACT QUANTITY
          </Typography>
        </Grid>
        <Grid item sm={6}>
          <Stack spacing={2}>
            <Select
              options={PerformanceTypes}
              name="PerformanceType"
              label="PERFORMANCE TYPE"
              valueKey="Code"
              labelKey="DisplayName"
              disabled
              fullWidth
            />
            <DisplayController
              show={({ values }) =>
                values?.PerformanceType === PerformanceTypeCode.FIRM_FIXED
              }
            >
              <TextField
                name="FFQty"
                label="QTY/DAY (MMBTUS)"
                fullWidth
                disabled
              />
            </DisplayController>
            <DisplayController
              show={({ values }) =>
                values?.PerformanceType === PerformanceTypeCode.FIRM_VARIABLE
              }
            >
              <TextField
                name="FVMinQty"
                label="MINIMUM QTY/DAY (MMBTUS)"
                fullWidth
                disabled
              />
              <TextField
                name="FVMaxQty"
                label="MAXIMUM QTY/DAY (MMBTUS)"
                fullWidth
                disabled
              />
            </DisplayController>
            <DisplayController
              show={({ values }) =>
                values?.PerformanceType === PerformanceTypeCode.INTERRUPTIBLE
              }
            >
              <TextField
                name="ITMaxQty"
                label="MAXIMUM QTY/DAY (MMBTUS)"
                fullWidth
                disabled
              />
            </DisplayController>
          </Stack>
        </Grid>
      </Grid>
      <Box py={3} display="flex" justifyContent="flex-end">
        <Outcomes trade={trade} />
      </Box>
    </Form>
  );
};
