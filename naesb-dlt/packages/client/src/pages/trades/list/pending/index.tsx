import { PageContainer } from '@common/page';
import { useState } from 'react';
import { Button, Card } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CreateTradeDialog } from '../../create';

// TODO: Just a placeholder for now
export const TradesPendingList = () => {
  const [createFormOpen, setCreateFormOpen] = useState(false);
  return (
    <PageContainer
      title="Trades"
      size="xl"
      action={
        <Button
          onClick={() => setCreateFormOpen(true)}
          color="primary"
          variant="contained"
        >
          <AddIcon /> Create Trade
        </Button>
      }
    >
      <CreateTradeDialog
        open={createFormOpen}
        handleClose={() => setCreateFormOpen(false)}
      />

      <Card>Not done yet</Card>
    </PageContainer>
  );
};
