import {
  Box,
  Grid,
  Modal,
  ModalDialog,
  Tab,
  TabList,
  TabPanel,
  Tabs,
  Typography,
} from '@mui/joy';
import { IDelivery } from '@naesb/dlt-model';
import { FC } from 'react';
import { useDecoratedDelivery } from 'query/deliveries';
import { DisplayText } from 'components/shared/display';
import { formatDate } from 'components/shared/util';
import { NominationForm } from './Nomination';
import { Allocations } from './Allocation';

export interface DeliveryModalProps {
  open: boolean;
  handleClose: () => void;
  delivery: IDelivery;
}

export const DeliveryModal: FC<DeliveryModalProps> = ({
  open,
  handleClose,
  delivery,
}) => {
  const { data, isLoading } = useDecoratedDelivery(delivery.DeliveryId);
  return (
    <Modal open={open} onClose={handleClose}>
      <ModalDialog sx={{ paddingX: 0, width: '60vw' }}>
        {open && (
          <Box sx={{ overflowY: 'auto', overflowX: 'hidden' }} px={2}>
            <Typography level="h4" sx={{ lineHeight: 1 }}>
              {delivery.TspDeliveryId || delivery.DeliveryId}
            </Typography>
            <Typography level="body-sm">Delivery Details</Typography>
            <Grid container spacing={2} sx={{ marginTop: 2, marginBottom: 2 }}>
              <Grid xs={12} md={6} lg={6}>
                <DisplayText
                  label="TSP"
                  field="_meta.Tsp.name"
                  data={data}
                  isLoading={isLoading}
                />
              </Grid>
              <Grid xs={12} md={6} lg={3}>
                <DisplayText
                  label="Date"
                  field="Date"
                  valueFormatter={({ value }) =>
                    value
                      ? formatDate(delivery.Date, 'MMM d, yyyy', true)
                      : undefined
                  }
                  data={data}
                  isLoading={isLoading}
                />
              </Grid>
              <Grid xs={12} md={6} lg={3}>
                <DisplayText
                  label="Requestor"
                  field="_meta.ServiceRequestorParty.name"
                  data={data}
                  isLoading={isLoading}
                />
              </Grid>
              <Grid xs={12} md={6} lg={3}>
                <DisplayText
                  label="Receiver"
                  field="_meta.ReceivingParty.name"
                  data={data}
                  isLoading={isLoading}
                />
              </Grid>
              <Grid xs={12} md={6} lg={3}>
                <DisplayText
                  label="Nominated Qty"
                  field="NominatedQuantity"
                  data={data}
                  isLoading={isLoading}
                />
              </Grid>
              <Grid xs={12} md={6} lg={3}>
                <DisplayText
                  label="Scheduled Qty"
                  field="ScheduledQuantity"
                  data={data}
                  isLoading={isLoading}
                />
              </Grid>
              <Grid xs={12} md={6} lg={3}>
                <DisplayText
                  label="Actual Qty"
                  field="ActualQuantity"
                  data={data}
                  isLoading={isLoading}
                />
              </Grid>
            </Grid>
            <Tabs aria-label="Basic tabs" defaultValue={0}>
              <TabList>
                <Tab>Allocation</Tab>
                <Tab>Settings</Tab>
                <Tab>History</Tab>
              </TabList>
              <TabPanel value={0}>
                {Boolean(data) && <Allocations delivery={data as any} />}
              </TabPanel>
              <TabPanel value={1}>
                {Boolean(data) && (
                  <NominationForm delivery={data as IDelivery} />
                )}
              </TabPanel>
              <TabPanel value={2}>
                <b>Third</b> tab panel
              </TabPanel>
            </Tabs>

            {/* @ts-ignore */}
            {}
          </Box>
        )}
      </ModalDialog>
    </Modal>
  );
};
