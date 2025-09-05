import { BaseDatePicker } from '@common/form';
import { Box, Button } from '@mui/material';
import { dateFormatter, DrilldownCellRenderer, Grid } from '@react/toolkit';
import { ColDef } from 'ag-grid-community';
import AddIcon from '@mui/icons-material/Add';
import { useState, FC, Dispatch, SetStateAction } from 'react';
import { useSearchInvoices } from '@query/invoices';
import { CreateInvoiceDialog } from '@pages/invoices/create';

const colDefs: Array<ColDef> = [
  {
    field: 'InvoicePeriodStart',
    headerName: 'Start',
    flex: 1,
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
    sort: 'asc',
  },
  {
    field: 'InvoicePeriodEnd',
    headerName: 'End',
    flex: 1,
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
    sort: 'asc',
  },
  { field: 'InvoiceId', headerName: 'Invoice', width: 400 },
  { field: 'Name', headerName: 'Name', width: 400 },
  {
    field: 'InvoiceId',
    headerName: '',
    cellRendererFramework: DrilldownCellRenderer,
    width: 65,
    cellClass: 'custom-ag-flex-end',
    cellRendererParams: {
      buildRoute: ({ value, routeParams }: any) =>
        `/channels/${routeParams.channelId}/invoices/${value}`,
    },
    valueFormatter: () => 'View',
    minWidth: 75,
    maxWidth: 75,
  },
];

export interface InvoiceListProps {
  startDate?: string;
  endDate?: string;
  setStartDate: Dispatch<SetStateAction<string | undefined>>;
  setEndDate: Dispatch<SetStateAction<string | undefined>>;
}

export const InvoiceList: FC<InvoiceListProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
}) => {
  const [createFormOpen, setCreateFormOpen] = useState(false);
  const { data } = useSearchInvoices({
    // query: [
    //   {
    //     InvoicePeriodStart: {
    //       type: QueryOperator.BETWEEN,
    //       filter: [startDate, endDate],
    //     },
    //   },
    //   {
    //     InvoicePeriodEnd: {
    //       type: QueryOperator.BETWEEN,
    //       filter: [startDate, endDate],
    //     },
    //   },
    //   {
    //     InvoicePeriodStart: {
    //       type: QueryOperator.MORE_THAN_OR_EQUAL,
    //       filter: endDate,
    //     },
    //     InvoicePeriodEnd: {
    //       type: QueryOperator.LESS_THAN_OR_EQUAL,
    //       filter: startDate,
    //     },
    //   },
    // ],
  });

  return (
    <>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box>
          <BaseDatePicker
            useUtc
            sx={{ marginRight: 2 }}
            label="Start"
            value={startDate}
            onChange={(value: Date | null) =>
              setStartDate(value?.toISOString())
            }
          />
          <BaseDatePicker
            useUtc
            label="End"
            value={endDate}
            onChange={(value: Date | null) => setEndDate(value?.toISOString())}
          />
        </Box>
        <Button
          onClick={() => setCreateFormOpen(true)}
          color="primary"
          variant="contained"
          sx={{ marginLeft: 2 }}
        >
          <AddIcon /> Create Invoice
        </Button>
      </Box>
      <CreateInvoiceDialog
        open={createFormOpen}
        handleClose={() => setCreateFormOpen(false)}
      />
      <Box my={2} flexGrow={1} height="100%">
        <Grid
          columnDefs={colDefs}
          rowData={data?.data}
          gridOptions={{ domLayout: 'normal' }}
          gridId="channel-invoices"
          persistState
          getRowNodeId={(innerData) => `${innerData.InvoiceId}`}
        />
      </Box>
    </>
  );
};
