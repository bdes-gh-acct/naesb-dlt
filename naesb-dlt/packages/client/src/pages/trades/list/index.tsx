import { PageContainer } from '@common/page';
import { useState } from 'react';
import { Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { CreateTradeDialog } from '../create';
import { TradesGrid } from './Grid';

export const TradesList = () => {
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

      <TradesGrid />
    </PageContainer>
  );
};
