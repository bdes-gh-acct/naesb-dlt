import { ColDef } from 'ag-grid-community';
import { useTrade, useTradeHistory } from 'query/trade';
import { useParams } from '@tanstack/router';
import { Box, Card, Divider, Typography } from '@mui/joy';
import {
  dateFormatter,
  statusFormatter,
} from 'components/shared/table/formatters';
import { DataGrid } from 'components/shared/table';

const colDefs: Array<ColDef> = [
  {
    field: 'Data.Revision',
    headerName: 'Revision',
    flex: 1,
  },
  {
    field: 'Data.Status',
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
  // {
  //   field: 'TxId',
  //   headerName: '',
  //   width: 65,
  //   cellClass: 'custom-ag-flex-end',
  //   cellRendererFramework: DialogCellRenderer,
  //   cellRendererParams: {
  //     renderContent: ({ value, data }: any) => (
  //       <BlockDialog value={value} data={data} />
  //     ),
  //   },
  // },
];

export const TradeHistoryGrid = () => {
  const { tradeId } = useParams();
  const { data: trade } = useTrade(tradeId);
  const { data } = useTradeHistory(tradeId, trade?.ChannelId);
  return (
    <Card sx={{ paddingX: 0, marginTop: 2, paddingTop: 2 }}>
      <Box mb={1} mx={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography level="title-md" sx={{ marginBottom: 1 }}>
            Trade History
          </Typography>
        </Box>
        <Divider sx={{ marginTop: 1 }} />
      </Box>
      <DataGrid
        columnDefs={colDefs}
        rowData={data}
        gridId="channel-trades-history"
        getRowId={({ data: innerData }) => innerData.TxId}
      />
    </Card>
  );
};
