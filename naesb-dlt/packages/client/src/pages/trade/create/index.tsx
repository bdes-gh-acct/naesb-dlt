import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import {
  ITradeViewModel,
  PerformanceTypeCode,
  PerformanceTypes,
  PriceIndexes,
  PriceTypeCode,
  PriceTypes,
} from '@naesb/dlt-model';
import { useCreateTrade } from '@query/trades';
import {
  ChannelOrganizationLookup,
  DatePicker,
  Form,
  Select,
  TextField,
} from '@common/form';
import { FC } from 'react';
import { startOfDay } from 'date-fns';
import { FormSection } from '@common/form/section';
import { DisplayController } from '@common/form/displayController';
import { createTradeSchema } from '@common/form/schemas/trade';
import { TspLocationLookup } from '@common/form/input/tspLocationLookup';
import { toUtc } from '@react/toolkit';

export interface CreateTradeDialogProps {
  open: boolean;
  handleClose: () => void;
  channelId: string;
}

export const CreateTradeDialog: FC<CreateTradeDialogProps> = ({
  open,
  handleClose,
  channelId,
}) => {
  const { mutate } = useCreateTrade(() => handleClose());
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      onClose={handleClose}
      scroll="body"
    >
      <DialogTitle>Create Trade</DialogTitle>
      <Form
        schema={createTradeSchema}
        onSubmit={async (trade: ITradeViewModel) => {
          try {
            await mutate(trade as any);
          } catch (e) {
            return e;
          }
          handleClose();
          return undefined;
        }}
        initialValues={{
          BuyerParty: 'D001883032',
          SellerParty: undefined,
          DeliveryPeriodStart: toUtc(startOfDay(new Date())).toISOString(),
          DeliveryPeriodEnd: toUtc(startOfDay(new Date())).toISOString(),
          PriceType: PriceTypeCode.FIXED,
          PerformanceType: PerformanceTypeCode.FIRM_FIXED,
        }}
      >
        {/* <CreateTradeStepperForm /> */}
        <DialogContent>
          <FormSection title="BASIC INFO">
            <TextField name="DealId" label="DEAL NUMBER" fullWidth />
            <TextField
              name="BaseContractNumber"
              type="number"
              label="BASE CONTRACT NUMBER"
              fullWidth
            />
            <TspLocationLookup
              name="DeliveryLocation"
              label="DELIVERY LOCATION"
              tspNumberKey="TspBusinessId"
            />
            <DatePicker
              name="DeliveryPeriodStart"
              label="BEGIN"
              fullWidth
              useUtc
            />
            <DatePicker name="DeliveryPeriodEnd" label="END" fullWidth useUtc />
          </FormSection>

          <FormSection title="BUYER">
            <ChannelOrganizationLookup
              name="BuyerParty"
              label="BUYER ORGANIZATION"
              channelId={channelId}
              fullWidth
            />
          </FormSection>
          <FormSection title="SELLER">
            <ChannelOrganizationLookup
              name="SellerParty"
              label="SELLER ORGANIZATION"
              channelId={channelId}
              fullWidth
            />
          </FormSection>
          <FormSection title="PRICING">
            <Select
              options={PriceTypes}
              labelKey="DisplayName"
              valueKey="Code"
              name="PriceType"
              label="PRICE TYPE"
              fullWidth
            />
            <DisplayController
              show={({ values }) => values?.PriceType === PriceTypeCode.FIXED}
            >
              <TextField
                name="Price"
                label="PRICE (USD)"
                type="number"
                fullWidth
              />
            </DisplayController>
            <DisplayController
              show={({ values }) => values?.PriceType === PriceTypeCode.INDEX}
            >
              <Select
                name="PriceIndex"
                label="INDEX"
                options={PriceIndexes}
                labelKey="DisplayName"
                valueKey="Code"
                fullWidth
              />
              <TextField
                name="PriceIndexDifferential"
                label="PRICE MODIFIER (USD)"
                type="number"
                fullWidth
              />
            </DisplayController>
          </FormSection>
          <FormSection title="PERFORMANCE OBLIGATION & CONTRACT QUANTITY">
            <Select
              name="PerformanceType"
              labelKey="DisplayName"
              valueKey="Code"
              options={PerformanceTypes}
              label="PERFORMANCE TYPE"
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
                type="number"
                fullWidth
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
                type="number"
                fullWidth
              />
              <TextField
                name="FVMaxQty"
                label="MAXIMUM QTY/DAY (MMBTUS)"
                type="number"
                fullWidth
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
                type="number"
                fullWidth
              />
            </DisplayController>
          </FormSection>
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
