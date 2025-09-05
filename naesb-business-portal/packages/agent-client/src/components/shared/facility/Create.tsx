import { Box, Grid, Modal, ModalDialog } from '@mui/joy';
import {
  ICreateTradeRequest,
  ITrade,
  PerformanceTypeCode,
  PerformanceTypes,
  PriceTypeCode,
  PriceTypes,
} from '@naesb/dlt-model';
import { FC } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCreateTrade } from 'query/trade';
import { startOfDay } from 'date-fns';
import { FormDivide } from 'components/shared/form/divide';
import { useChannel } from 'query/channel';
import { useOrgMsp } from 'utils/auth';
import { Form, TextField } from '../form';
import { DisplayController } from '../form/display';
// import { DatePicker } from '../form/input/date';
import { fromUtc, useWidth } from '../util';
import { TspLocationLookup } from '../form/input/tspLocation';
import { Select } from '../form/input/select';
import { PriceIndexLookup } from '../form/input/priceIndex';
import { PartyInput } from '../form/input/trade/Party';
import { BuySellInput } from '../form/input/trade/BuySell';
import { createTradeSchema } from './schema';
import { DatePicker } from '../form/input/date';

export interface CreateTradeDialogProps {
  open: boolean;
  handleClose: () => void;
  channelId?: string;
}

export interface ITradeForm extends Omit<ITrade, 'BuyerParty' | 'SellerParty'> {
  Type: 'Buy' | 'Sell';
  Party: string;
  CounterParty: string;
  ChannelId?: string;
}

export const CreateFacilityDialog: FC<CreateTradeDialogProps> = ({
  open,
  handleClose,
  channelId,
}) => {
  const { data: channel } = useChannel(channelId);
  const { mspId } = useOrgMsp();
  const { mutateAsync } = useCreateTrade(() => handleClose());
  const width = useWidth();
  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog sx={{ paddingX: 0 }}>
        <Box sx={{ overflowY: 'auto', overflowX: 'hidden' }} px={2}>
          <Form
            onSubmitError={(errors) => console.log(errors)}
            resolver={zodResolver(createTradeSchema)}
            onSubmit={async (
              values: ICreateTradeRequest & {
                ChannelId: string;
                Type: string;
                BaseContractNumber: number;
              },
            ) => {
              try {
                await mutateAsync(values);
              } catch (e) {
                return e;
              }
              return undefined;
            }}
            defaultValues={{
              ChannelId: channelId,
              Type: 'Buy',
              BaseContractNumber: 12345,
              BuyerParty: mspId,
              SellerParty: channel?.CounterpartyId,
              DeliveryPeriodStart: fromUtc(
                startOfDay(new Date()),
              )?.toISOString(),
              DeliveryPeriodEnd: fromUtc(startOfDay(new Date()))?.toISOString(),
              PriceType: PriceTypeCode.FIXED,
              PerformanceType: PerformanceTypeCode.FIRM_FIXED,
            }}
          >
            {/* <CreateTradeStepperForm /> */}
            <Grid container columnSpacing={2}>
              <Grid xs={12}>
                <FormDivide title="Basic Info" />
              </Grid>
              <Grid xs={12}>
                <BuySellInput />
              </Grid>
              <Grid xs={12}>
                <PartyInput name="BuyerParty" label="Buyer" />
              </Grid>
              <Grid xs={12}>
                <PartyInput name="SellerParty" label="Seller" />
              </Grid>
              <DisplayController show={({ values }) => values?.Type === 'Buy'}>
                <Grid xs={12}>
                  <TextField name="BuyerDealId" label="Deal Id" fullWidth />
                </Grid>
              </DisplayController>
              <DisplayController show={({ values }) => values?.Type === 'Sell'}>
                <Grid xs={12}>
                  <TextField name="SellerDealId" label="Deal Id" fullWidth />
                </Grid>
              </DisplayController>
              <Grid xs={12}>
                <FormDivide title="Delivery" />
              </Grid>
              <Grid xs={12}>
                <TspLocationLookup
                  name="DeliveryLocation"
                  label="Delivery Location"
                  tspNumberKey="TspBusinessId"
                />
              </Grid>
              <Grid sm={6} xs={12}>
                {' '}
                <DatePicker
                  name="DeliveryPeriodStart"
                  label="Begin"
                  fullWidth
                  useUtc
                />
              </Grid>
              <Grid sm={6} xs={12}>
                {' '}
                <DatePicker
                  name="DeliveryPeriodEnd"
                  label="End"
                  fullWidth
                  useUtc
                />
              </Grid>
              <Grid xs={12}>
                <FormDivide title="Pricing" />
              </Grid>
              <Grid sm={6} xs={12}>
                <Select
                  options={PriceTypes}
                  labelKey="DisplayName"
                  valueKey="Code"
                  name="PriceType"
                  label="Price Type"
                />
              </Grid>
              <DisplayController
                show={({ values }) => values?.PriceType === PriceTypeCode.FIXED}
              >
                <Grid sm={6} xs={12}>
                  <TextField
                    name="Price"
                    label="Price (USD/MMBtu)"
                    type="number"
                    fullWidth
                  />
                </Grid>
              </DisplayController>
              <DisplayController
                show={({ values }) => values?.PriceType === PriceTypeCode.INDEX}
              >
                <Grid sm={6} xs={12}>
                  <PriceIndexLookup name="PriceIndex" label="Index" />
                </Grid>
                {width !== 'xs' && <Grid sm={6} />}
                <Grid sm={6} xs={12}>
                  <TextField
                    name="PriceIndexDifferential"
                    label="Price Modifier (USD/MMBtu)"
                    type="number"
                    fullWidth
                  />
                </Grid>
              </DisplayController>
              <Grid xs={12}>
                <FormDivide title="Volume" />
              </Grid>
              <Grid sm={6} xs={12}>
                <Select
                  name="PerformanceType"
                  labelKey="DisplayName"
                  valueKey="Code"
                  options={PerformanceTypes}
                  label="Performance Type"
                />
              </Grid>
              <DisplayController
                show={({ values }) =>
                  values?.PerformanceType === PerformanceTypeCode.FIRM_FIXED
                }
              >
                <Grid sm={6} xs={12}>
                  <TextField
                    name="FFQty"
                    label="QTY/Day (MMBtu)"
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
                <Grid sm={6} xs={12}>
                  <TextField
                    name="FVMinQty"
                    label="Min QTY/Day (MMBtu)"
                    type="number"
                    fullWidth
                  />
                </Grid>
                {width !== 'xs' && <Grid sm={6} />}
                <Grid sm={6} xs={12}>
                  <TextField
                    name="FVMaxQty"
                    label="Max QTY/Day (MMBtu)"
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
                <Grid sm={6} xs={12}>
                  <TextField
                    name="ITMaxQty"
                    label="Max QTY/Day (MMBtu)"
                    type="number"
                    fullWidth
                  />
                </Grid>
              </DisplayController>
            </Grid>
          </Form>
        </Box>
      </ModalDialog>
    </Modal>
  );
};
