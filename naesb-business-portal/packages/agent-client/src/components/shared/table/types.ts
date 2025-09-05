import { ColDef, ColGroupDef } from 'ag-grid-community';
import { AgGridReactProps } from 'ag-grid-react';

export interface DataGridProps<TData extends object>
  extends Omit<AgGridReactProps<TData>, 'gridOptions'> {
  gridId?: string;
  columnDefs: Array<ColDef | ColGroupDef>;
  rowData?: Array<TData>;
}
