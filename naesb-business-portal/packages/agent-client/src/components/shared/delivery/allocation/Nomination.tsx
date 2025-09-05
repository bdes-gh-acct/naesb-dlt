import { Grid } from '@mui/joy';
import { IDelivery } from '@naesb/dlt-model';
import { FC, useMemo } from 'react';
import { useUpdateDeliverySchedule } from 'query/deliveries';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, TextField } from 'components/shared/form';
import { useOrgMsp } from 'utils/auth';
import { useBusiness } from 'query/directory';
import { deliveryScheduleSchema } from './schema';

export interface NominationFormProps {
  delivery: IDelivery;
}

export const NominationForm: FC<NominationFormProps> = ({ delivery }) => {
  const { mspId } = useOrgMsp();
  const { data: directory } = useBusiness(mspId);
  const { mutateAsync: updateDeliverySchedule } = useUpdateDeliverySchedule(
    (values) => console.log(values),
  );
  const readonly = useMemo(() => {
    return (
      !directory || !directory.roles?.find((role) => role.businessRoleId === 1)
    );
  }, [directory]);
  return (
    <Form
      readonly={readonly}
      resolver={zodResolver(deliveryScheduleSchema)}
      onSubmit={async (
        values: IDelivery & {
          ChannelId: string;
        },
      ) => {
        try {
          await updateDeliverySchedule(values);
        } catch (e) {
          return e;
        }
        return undefined;
      }}
      defaultValues={delivery}
    >
      {/* <CreateTradeStepperForm /> */}
      <Grid container columnSpacing={2}>
        <Grid xs={12}>
          <TextField
            name="NominatedQuantity"
            label="Nominated Qty"
            disabled
            type="number"
          />
        </Grid>
        <Grid xs={12}>
          <TextField
            name="ScheduledQuantity"
            label="Scheduled Qty"
            disabled={readonly}
            type="number"
          />
        </Grid>
        <Grid xs={12}>
          <TextField
            name="ActualQuantity"
            label="Actual Qty"
            disabled={readonly}
            type="number"
          />
        </Grid>
      </Grid>
    </Form>
  );
};
