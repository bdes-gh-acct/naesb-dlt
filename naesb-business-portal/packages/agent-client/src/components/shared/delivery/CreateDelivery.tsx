import { Box, Grid, Modal, ModalDialog } from '@mui/joy';
import { ICreateDeliveryRequest } from '@naesb/dlt-model';
import { FC } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormDivide } from 'components/shared/form/divide';
import { useChannel } from 'query/channel';
import { useCreateDelivery } from 'query/deliveries';
import { Form, TextField } from '../form';
import { TspLocationLookup } from '../form/input/tspLocation';
import { createDeliverySchema } from './schema';
import { DatePicker } from '../form/input/date';
import { OrganizationLookup } from '../form/input/organization';

export interface CreateDeliveryDialogProps {
  open: boolean;
  handleClose: () => void;
  channelId?: string;
}

export const CreateDeliveryDialog: FC<CreateDeliveryDialogProps> = ({
  open,
  handleClose,
  channelId,
}) => {
  const { data: channel, isLoading } = useChannel(channelId);
  const { mutateAsync } = useCreateDelivery(() => handleClose());
  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog sx={{ paddingX: 0 }}>
        <Box sx={{ overflowY: 'auto', overflowX: 'hidden' }} px={2}>
          {!isLoading ? (
            <Form
              onSubmitError={(errors) => console.log(errors)}
              resolver={zodResolver(createDeliverySchema)}
              onSubmit={async (
                values: ICreateDeliveryRequest & {
                  ChannelId: string;
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
                ReceivingParty: channel?.CounterpartyId,
              }}
            >
              {/* <CreateTradeStepperForm /> */}
              <Grid container columnSpacing={2}>
                <Grid xs={12}>
                  <FormDivide title="Basic Info" />
                </Grid>
                <Grid xs={12}>
                  <TextField
                    name="TspDeliveryId"
                    label="Contract Number"
                    fullWidth
                  />
                </Grid>
                <Grid xs={12}>
                  <OrganizationLookup
                    name="ReceivingParty"
                    label="Recipient"
                    requireChannel
                  />
                </Grid>
                <Grid xs={12}>
                  <TspLocationLookup
                    name="DeliveryLocation"
                    label="Delivery Location"
                    tspNumberKey="TspBusinessId"
                  />
                </Grid>
                <Grid xs={12}>
                  <DatePicker name="Date" label="Date" fullWidth useUtc />
                </Grid>{' '}
                <Grid xs={12}>
                  <TextField
                    name="NominatedQuantity"
                    label="Nominated Qty (MMBtu)"
                    fullWidth
                    type="number"
                  />
                </Grid>
              </Grid>
            </Form>
          ) : (
            <></>
          )}
        </Box>
      </ModalDialog>
    </Modal>
  );
};
