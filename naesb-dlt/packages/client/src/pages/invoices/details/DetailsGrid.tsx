import {
  ColDef,
  ValueGetterParams,
  ValueFormatterParams,
} from 'ag-grid-community';
import { dateFormatter, Grid, DialogCellRenderer } from '@react/toolkit';
import { Card } from '@mui/material';
import { FC } from 'react';
import numeral from 'numeral';
import { InvoiceDetailsDialog } from './InvoiceDetailsDialog';

const colDefs: Array<ColDef> = [
  {
    field: 'Trade.DealId',
    headerName: 'Deal #',
    flex: 1,
  },
  { field: 'Trade.OrgDealId', headerName: 'Org Deal ID', flex: 1 },
  { field: 'Trade.CounterpartyDealId', headerName: 'Counterparty ID', flex: 1 },
  {
    field: 'Trade.Type',
    headerName: 'Type',
    flex: 1,
  },
  {
    field: 'Trade.DeliveryLocation',
    headerName: 'Location',
    flex: 1,
  },
  {
    field: 'Price',
    headerName: 'Price',
    flex: 1,
  },
  {
    field: 'Quantity',
    headerName: 'Max Volume',
    valueGetter: ({ data }: ValueGetterParams) => {
      return data
        ? data.Trade?.Type === 'Sell'
          ? -Math.abs(data.Trade?.MaxDailyQuantity)
          : Math.abs(data.Trade?.MaxDailyQuantity)
        : '';
    },
    flex: 1,
  },

  {
    field: 'Quantity',
    headerName: 'Actual',
    valueGetter: ({ data }: ValueGetterParams) => {
      return data
        ? data.Trade?.Type === 'Sell'
          ? -Math.abs(data.Quantity)
          : Math.abs(data.Quantity)
        : '';
    },
    flex: 1,
  },
  {
    field: 'Quantity',
    headerName: 'Imbalance',
    valueGetter: ({ data }: ValueGetterParams) => {
      return data
        ? data.Quantity - Math.abs(data.Trade.MaxDailyQuantity)
        : undefined;
    },
    flex: 1,
  },
  {
    field: 'Date',
    headerName: 'Date',
    flex: 1,
    valueFormatter: dateFormatter('MMM dd, yyyy', true),
  },
  {
    headerName: 'Value',
    flex: 1,
    valueGetter: ({ data }: ValueGetterParams) =>
      (data.Trade?.Type === 'Sell'
        ? Math.abs(data.Quantity)
        : -Math.abs(data.Quantity)) * data.Price,
    valueFormatter: ({ value }: ValueFormatterParams) =>
      value ? numeral(value).format('$0,0[.]00') : 0,
  },
  {
    headerName: '',
    pinned: 'right',
    width: 65,
    cellRendererFramework: DialogCellRenderer,
    cellRendererParams: {
      renderContent: InvoiceDetailsDialog,
      maxWidth: 'lg',
    },
  },
];

export interface InvoiceDetailsGridProps {
  data?: Array<any>;
}

export const InvoiceDetailsGrid: FC<InvoiceDetailsGridProps> = ({ data }) => {
  return (
    <Card sx={{ height: 'calc(100% - 77px)' }}>
      <Grid
        columnDefs={colDefs}
        rowData={data}
        getRowNodeId={(item: any) => `${item.DealId}${item.Date}`}
        gridOptions={{ domLayout: 'normal' }}
        gridId="invoicedetails"
        persistState
      />
    </Card>
  );
};
