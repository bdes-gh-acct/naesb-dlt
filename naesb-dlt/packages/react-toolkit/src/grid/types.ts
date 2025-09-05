import {
  GridOptions,
  RowClickedEvent,
  ColDef,
  ColGroupDef,
} from 'ag-grid-community';
import { AgGridReactProps } from 'ag-grid-react';
import { ReactFragment, ReactNode } from 'react';

export interface GridProps extends AgGridReactProps {
  action?: ReactNode;
  gridId?: string;
  persistState?: boolean;
  className?: string;
  columnDefs: Array<ColDef | ColGroupDef>;
  gridOptions?: GridOptions;
  handleRowClicked?: (event: RowClickedEvent) => void;
  hideTools?: boolean;
  rowData?: Array<any>;
  title?: ReactFragment | string;
}
