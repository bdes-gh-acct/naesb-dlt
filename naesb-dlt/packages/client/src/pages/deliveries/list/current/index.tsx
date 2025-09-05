import { PageContainer } from '@common/page';
import { useState } from 'react';
import { Button, Card } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CreateDeliveryDialog } from '../../create';

// TODO: Just a placeholder for now
export const DeliveriesCurrentList = () => {
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
      <CreateDeliveryDialog
        open={createFormOpen}
        handleClose={() => setCreateFormOpen(false)}
      />
      <Card>Not done yet</Card>
    </PageContainer>
  );
};
