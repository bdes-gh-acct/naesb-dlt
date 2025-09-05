import { ColDef } from 'ag-grid-community';
import { statusFormatter } from '@common/grid';
import { useTradeHistory } from '@query/trades';
import { Card } from '@common/card';
import { useParams } from 'react-router-dom';
import { dateFormatter, DialogCellRenderer, Grid } from '@react/toolkit';
import { BlockDialog } from './BlockDialog';

const colDefs: Array<ColDef> = [
  {
    field: 'ITradeViewModel.Status',
    headerName: 'Status',
    flex: 1,
    valueFormatter: statusFormatter,
  },
  {
    field: 'Timestamp',
    headerName: 'Timestamp',
    flex: 1,
    valueFormatter: dateFormatter(),
  },
  {
    field: 'TxId',
    headerName: '',
    width: 65,
    cellClass: 'custom-ag-flex-end',
    cellRendererFramework: DialogCellRenderer,
    cellRendererParams: {
      renderContent: ({ value, data }: any) => (
        <BlockDialog value={value} data={data} />
      ),
    },
  },
];

export const TradeHistoryGrid = () => {
  const { channelId, tradeId } = useParams<{
    channelId: string;
    tradeId: string;
  }>();
  const { data } = useTradeHistory(channelId, tradeId);
  return (
    <Card title="HISTORY">
      <Grid
        columnDefs={colDefs}
        rowData={data}
        gridId="channel-trades-history"
        persistState={false}
        getRowNodeId={(innerData) => innerData.TxId}
      />
    </Card>
  );
};
