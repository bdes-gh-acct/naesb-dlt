import { ColDef } from 'ag-grid-community';
import { Card } from '@common/card';
import { Grid } from '@react/toolkit';
import { useState } from 'react';
import { CreateTradeDialog } from '@pages/trade/create';
import { useParams } from 'react-router-dom';
import { useChannelContractsInfo } from '@query/channels';

const colDefs: Array<ColDef> = [
  { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'version', headerName: 'Version', flex: 1 },
];

export const ChannelContractsGrid = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { data } = useChannelContractsInfo(channelId);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  return (
    <Card title="CONTRACTS">
      <CreateTradeDialog
        open={createFormOpen}
        handleClose={() => setCreateFormOpen(false)}
        channelId={channelId}
      />
      <Grid
        columnDefs={colDefs}
        rowData={data?.chaincodes}
        gridId="channel-contracts"
        persistState
        getRowNodeId={(innerData) => innerData.name}
      />
    </Card>
  );
};
