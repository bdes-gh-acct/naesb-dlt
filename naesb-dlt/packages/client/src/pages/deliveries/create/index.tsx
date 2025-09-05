import { Dialog, DialogActions, DialogContent, Grid } from '@mui/material';
import { ICreateDeliveryRequest } from '@naesb/dlt-model';
import { DatePicker, Form, Submit, TextField } from '@common/form';
import { FC } from 'react';
import { FormDivide } from '@common/form/section';
import { TspLocationLookup } from '@common/form/input/tspLocationLookup';
import { useAuth0 } from '@auth0/auth0-react';
import { get } from 'lodash';
import { useCreateDelivery } from '@query/deliveries';
import { createDeliverySchema } from '@common/form/schemas/delivery';
import { toUtc } from '@react/toolkit';
import { startOfDay } from 'date-fns';
import { ChannelInput } from './ChannelInput';

export interface CreadDeliveryDialogProps {
  open: boolean;
  handleClose: () => void;
}

export const CreateDeliveryDialog: FC<CreadDeliveryDialogProps> = ({
  open,
  handleClose,
}) => {
  const { user } = useAuth0();
  const { mutate } = useCreateDelivery(() => handleClose());
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      onClose={handleClose}
      scroll="body"
    >
      <Form
        schema={createDeliverySchema}
        onSubmit={async ({
          Date: DeliveryDate,
          ...values
        }: ICreateDeliveryRequest & { ChannelId: string }) => {
          try {
            await mutate({
              Date: toUtc(startOfDay(new Date(DeliveryDate))).toISOString(),
              ...values,
            });
          } catch (e) {
            return e;
          }
          return undefined;
        }}
        initialValues={{
          ServiceRequestorParty: get(user, 'https://naesbdlt.org/org_msp'),
        }}
      >
        {/* <CreateTradeStepperForm /> */}
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormDivide title="Basic Info" />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="TspDeliveryId"
                label="CONTRACT NUMBER"
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <ChannelInput name="BuyerParty" label="RECIPIENT" />
            </Grid>
            <Grid item xs={12}>
              <TspLocationLookup
                name="Location"
                label="DELIVERY LOCATION"
                tspNumberKey="TspBusinessId"
              />
            </Grid>
            <Grid item xs={12}>
              <DatePicker name="Date" label="DATE" fullWidth useUtc />
            </Grid>
            <Grid item xs={12}>
              <TextField
                name="NominatedQuantity"
                label="NOMINATION QTY"
                fullWidth
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ paddingX: 3, paddingBottom: 2 }}>
          <Submit>Create</Submit>
        </DialogActions>
      </Form>
    </Dialog>
  );
};
