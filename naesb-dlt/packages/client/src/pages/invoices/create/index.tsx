import { Dialog, DialogActions, DialogContent, Grid } from '@mui/material';
import { ICreateInvoiceRequest } from '@naesb/dlt-model';
import { DatePicker, Form, Submit, TextField } from '@common/form';
import { FC, useCallback, useState } from 'react';
import { FormDivide } from '@common/form/section';
import { addMonths, endOfDay, startOfMonth } from 'date-fns';
import { useCreateInvoice } from '@query/invoices';
import { useParams } from 'react-router-dom';
import { EndOfMonthDatePicker } from '@common/form/input/date/EndOfMonthDate';
import { object, string } from 'yup';
import { fromUtc, toUtc } from '@react/toolkit';

export interface CreateInvoiceDialogProps {
  open: boolean;
  handleClose: () => void;
}

const createInvoiceSchema = object().shape({
  InvoicePeriodEnd: string().required(),
  InvoicePeriodStart: string().required(),
  Name: string().required(),
});

export const CreateInvoiceDialog: FC<CreateInvoiceDialogProps> = ({
  open,
  handleClose,
}) => {
  const { mutateAsync } = useCreateInvoice(() => handleClose());
  const { channelId } = useParams<any>();
  const [initialValues] = useState({
    ChannelId: channelId,
    InvoicePeriodStart: toUtc(
      startOfMonth(addMonths(new Date(), -1)),
    ).toISOString(),
    InvoicePeriodEnd: new Date().toISOString(),
  });
  const onSubmit = useCallback(
    async ({
      InvoicePeriodStart: StartDate,
      InvoicePeriodEnd: EndDate,
      ...values
    }: ICreateInvoiceRequest & { ChannelId: string }) => {
      try {
        const data = {
          InvoicePeriodStart: StartDate,
          InvoicePeriodEnd: toUtc(
            endOfDay(fromUtc(new Date(EndDate))),
          ).toISOString(),
          ...values,
        };
        await mutateAsync(data);
      } catch (e) {
        return e;
      }
      return undefined;
    },
    [mutateAsync],
  );
  return (
    <Dialog
      open={open}
      fullWidth
      maxWidth="md"
      onClose={handleClose}
      scroll="body"
    >
      <Form
        schema={createInvoiceSchema}
        onSubmit={onSubmit}
        initialValues={initialValues}
      >
        {/* <CreateTradeStepperForm /> */}
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormDivide title="Basic Info" />
            </Grid>
            <Grid item xs={12}>
              <TextField name="Name" label="Name" fullWidth />
            </Grid>
            <Grid item xs={12}>
              <DatePicker
                name="InvoicePeriodStart"
                label="Start"
                fullWidth
                useUtc
              />
            </Grid>
            <Grid item xs={12}>
              <EndOfMonthDatePicker
                startName="InvoicePeriodStart"
                name="InvoicePeriodEnd"
                label="End"
                fullWidth
                useUtc
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
