import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  Grid,
} from '@mui/material';
import {
  ITradeViewModel,
  PerformanceTypeCode,
  PerformanceTypes,
  PriceTypeCode,
  PriceTypes,
} from '@naesb/dlt-model';
import { useCreateTrade } from '@query/trades';
import {
  createTradeSchema,
  DatePicker,
  Form,
  PriceIndexLookup,
  Select,
  TextField,
} from '@common/form';
import { FC } from 'react';
import { startOfDay } from 'date-fns';
import { FormDivide } from '@common/form/section';
import { DisplayController } from '@common/form/displayController';
import { TspLocationLookup } from '@common/form/input/tspLocationLookup';
import { toUtc, useWidth } from '@react/toolkit';
import { useAuth0 } from '@auth0/auth0-react';
import { get } from 'lodash';
import { PartyInput } from './PartyInput';
import { BuySellInput } from './BuySellInput';

export interface CreateTradeDialogProps {
  open: boolean;
  handleClose: () => void;
}

export interface ITradeForm
  extends Omit<ITradeViewModel, 'BuyerParty' | 'SellerParty'> {
  Type: 'Buy' | 'Sell';
  Party: string;
  CounterParty: string;
  ChannelId: string;
}

export const CreateTradeDialog: FC<CreateTradeDialogProps> = ({
  open,
  handleClose,
}) => {
  const { user } = useAuth0();
  const { mutate } = useCreateTrade(() => handleClose());
  const width = useWidth();
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      onClose={handleClose}
      scroll="body"
    >
      <Form
        schema={createTradeSchema}
        onSubmit={async (values: ITradeViewModel & { ChannelId: string }) => {
          try {
            await mutate(values);
          } catch (e) {
            return e;
          }
          return undefined;
        }}
        initialValues={{
          Type: 'Buy',
          BaseContractNumber: 12345,
          BuyerParty: get(user, 'https://naesbdlt.org/org_msp'),
          Party: get(user, 'https://naesbdlt.org/org_name'),
          DeliveryPeriodStart: toUtc(startOfDay(new Date())).toISOString(),
          DeliveryPeriodEnd: toUtc(startOfDay(new Date())).toISOString(),
          PriceType: PriceTypeCode.FIXED,
          PerformanceType: PerformanceTypeCode.FIRM_FIXED,
        }}
      >
        {/* <CreateTradeStepperForm /> */}
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormDivide title="Basic Info" />
            </Grid>
            <Grid item xs={12}>
              <BuySellInput />
            </Grid>
            <Grid item xs={12}>
              <PartyInput name="BuyerParty" label="Buyer" />
            </Grid>
            <Grid item xs={12}>
              <PartyInput name="SellerParty" label="Seller" />
            </Grid>
            <Grid item xs={12}>
              <FormDivide title="Delivery" />
            </Grid>
            <Grid item xs={12}>
              <TspLocationLookup
                name="DeliveryLocation"
                label="DELIVERY LOCATION"
                tspNumberKey="TspBusinessId"
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              {' '}
              <DatePicker
                name="DeliveryPeriodStart"
                label="BEGIN"
                fullWidth
                useUtc
              />
            </Grid>
            <Grid item sm={6} xs={12}>
              {' '}
              <DatePicker
                name="DeliveryPeriodEnd"
                label="END"
                fullWidth
                useUtc
              />
            </Grid>
            <Grid item xs={12}>
              <FormDivide title="Pricing" />
            </Grid>
            <Grid item sm={6} xs={12}>
              <Select
                options={PriceTypes}
                labelKey="DisplayName"
                valueKey="Code"
                name="PriceType"
                label="PRICE TYPE"
                fullWidth
              />
            </Grid>
            <DisplayController
              show={({ values }) => values?.PriceType === PriceTypeCode.FIXED}
            >
              <Grid item sm={6} xs={12}>
                <TextField
                  name="Price"
                  label="PRICE (USD)"
                  type="number"
                  fullWidth
                />
              </Grid>
            </DisplayController>
            <DisplayController
              show={({ values }) => values?.PriceType === PriceTypeCode.INDEX}
            >
              <Grid item sm={6} xs={12}>
                <PriceIndexLookup name="PriceIndex" label="INDEX" />
              </Grid>
              {width !== 'xs' && <Grid item sm={6} />}
              <Grid item sm={6} xs={12}>
                <TextField
                  name="PriceIndexDifferential"
                  label="PRICE MODIFIER (USD)"
                  type="number"
                  fullWidth
                />
              </Grid>
            </DisplayController>
            <Grid item xs={12}>
              <FormDivide title="Volume" />
            </Grid>
            <Grid item sm={6} xs={12}>
              <Select
                name="PerformanceType"
                labelKey="DisplayName"
                valueKey="Code"
                options={PerformanceTypes}
                label="PERFORMANCE TYPE"
                fullWidth
              />
            </Grid>
            <DisplayController
              show={({ values }) =>
                values?.PerformanceType === PerformanceTypeCode.FIRM_FIXED
              }
            >
              <Grid item sm={6} xs={12}>
                <TextField
                  name="FFQty"
                  label="QTY/DAY (MMBTUS)"
                  type="number"
                  fullWidth
                />
              </Grid>
            </DisplayController>
            <DisplayController
              show={({ values }) =>
                values?.PerformanceType === PerformanceTypeCode.FIRM_VARIABLE
              }
            >
              <Grid item sm={6} xs={12}>
                <TextField
                  name="FVMinQty"
                  label="MINIMUM QTY/DAY (MMBTUS)"
                  type="number"
                  fullWidth
                />
              </Grid>
              {width !== 'xs' && <Grid item sm={6} />}
              <Grid item sm={6} xs={12}>
                <TextField
                  name="FVMaxQty"
                  label="MAXIMUM QTY/DAY (MMBTUS)"
                  type="number"
                  fullWidth
                />
              </Grid>
            </DisplayController>
            <DisplayController
              show={({ values }) =>
                values?.PerformanceType === PerformanceTypeCode.INTERRUPTIBLE
              }
            >
              <Grid item sm={6} xs={12}>
                <TextField
                  name="ITMaxQty"
                  label="MAXIMUM QTY/DAY (MMBTUS)"
                  type="number"
                  fullWidth
                />
              </Grid>
            </DisplayController>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ paddingX: 3, paddingBottom: 2 }}>
          <Button type="submit" variant="contained" disableElevation>
            CREATE
          </Button>
        </DialogActions>
      </Form>
    </Dialog>
  );
};
