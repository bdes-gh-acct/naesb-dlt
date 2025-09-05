import { PageContainer } from '@common/page';
import { useState } from 'react';
import { Box, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CreateDeliveryDialog } from '../create';
import { DeliveriesGrid } from './Grid';

export const DeliveriesList = () => {
  const [createFormOpen, setCreateFormOpen] = useState(false);
  return (
    <PageContainer
      title="Deliveries"
      size="xl"
      action={
        <Button
          onClick={() => setCreateFormOpen(true)}
          color="primary"
          variant="contained"
        >
          <AddIcon /> Create Delivery
        </Button>
      }
    >
      <Box
        flexGrow={1}
        height="calc(100% - 64px)"
        display="flex"
        flexDirection="column"
        pb={2}
      >
        <CreateDeliveryDialog
          open={createFormOpen}
          handleClose={() => setCreateFormOpen(false)}
        />
        <DeliveriesGrid />
      </Box>
    </PageContainer>
  );
};
