import { ColDef } from 'ag-grid-community';
import {
  performanceFormatter,
  performanceTypeFormatter,
  priceFormatter,
  priceTypeFormatter,
  StatusCellRenderer,
} from '@common/grid';
import { dateFormatter, DrilldownCellRenderer, Grid } from '@react/toolkit';
import { useTrades } from '@query/trades';
import { Dispatch, FC, SetStateAction, useState } from 'react';
import { Button, Box } from '@mui/material';
import { CreateTradeDialog } from '@pages/trades/create';
import AddIcon from '@mui/icons-material/Add';
import { useParams } from 'react-router-dom';

const colDefs: Array<ColDef> = [
  { field: 'DealId', headerName: 'Deal #', flex: 1 },
  {
    field: 'Status',
    cellClass: 'custom-ag-flex-vert-center',
    headerName: 'Status',
    flex: 1,
    cellRendererFramework: StatusCellRenderer,
  },
  { field: 'DeliveryLocation', headerName: 'Location', flex: 1 },
  {
    field: 'PriceType',
    headerName: 'Price Type',
    valueFormatter: priceTypeFormatter,
    flex: 1,
  },
  {
    field: 'PriceType',
    headerName: 'Price',
    valueFormatter: priceFormatter,
    flex: 1,
  },
  {
    field: 'PerformanceType',
    headerName: 'Performance',
    flex: 1,
    valueFormatter: performanceTypeFormatter,
  },
  {
    field: 'PerformanceType',
    headerName: 'QTY/DAY',
    flex: 1,
    valueFormatter: performanceFormatter,
  },
  {
    field: 'DeliveryPeriodStart',
    headerName: 'Start Date',
    flex: 1,
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
  },
  {
    field: 'DeliveryPeriodEnd',
    headerName: 'End Date',
    flex: 1,
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
  },

  {
    field: 'DealId',
    headerName: '',
    cellRendererFramework: DrilldownCellRenderer,
    width: 65,
    cellClass: 'custom-ag-flex-end',
    cellRendererParams: {
      buildRoute: ({ value, routeParams }: any) =>
        `/channels/${routeParams.channelId}/trades/${value}`,
    },
    valueFormatter: () => 'View',
    minWidth: 75,
    maxWidth: 75,
  },
];

export interface TradesGridProps {
  startDate?: string;
  endDate?: string;
  setStartDate: Dispatch<SetStateAction<string | undefined>>;
  setEndDate: Dispatch<SetStateAction<string | undefined>>;
}

export const TradesGrid: FC<TradesGridProps> = () => {
  const { channelId } = useParams<{ channelId: string }>();
  const { data } = useTrades(channelId);
  const [createFormOpen, setCreateFormOpen] = useState(false);
  return (
    <>
      <Box my={2} display="flex" width="100%" flexDirection="row-reverse">
        <Button
          onClick={() => setCreateFormOpen(true)}
          color="primary"
          variant="contained"
        >
          <AddIcon /> Create Trade
        </Button>
      </Box>
      <CreateTradeDialog
        open={createFormOpen}
        handleClose={() => setCreateFormOpen(false)}
      />
      <Grid
        columnDefs={colDefs}
        rowData={data}
        gridId="channel-trades"
        gridOptions={{ domLayout: 'normal' }}
        persistState
        getRowNodeId={(innerData) => innerData.DealId}
      />
    </>
  );
};
