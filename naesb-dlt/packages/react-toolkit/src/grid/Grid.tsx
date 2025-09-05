import { useCallback, PropsWithChildren } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { get } from 'lodash';
import { GridOptions, GridReadyEvent } from 'ag-grid-community';
import { GridProps } from './types';
import { loadState } from './util/state';
import { useColumnState } from './useColumnState';
import './style.scss';

const defaultGridOptions: GridOptions = {
  domLayout: 'autoHeight',
};

const Grid = ({
  gridOptions = defaultGridOptions,
  handleRowClicked,
  onGridReady,
  rowData,
  persistState,
  gridId,
  onColumnMoved,
  onColumnResized,
  onColumnVisible,
  onColumnPinned,
  onSortChanged,
  onColumnPivotChanged,
  onColumnRowGroupChanged,
  onColumnValueChanged,
  components,
  ...props
}: PropsWithChildren<GridProps>) => {
  const handleGridReady = useCallback(
    (event: GridReadyEvent) => {
      const { columnApi } = event;
      if (onGridReady) {
        onGridReady(event);
      }
      if (gridId && persistState) {
        const state = loadState(gridId);
        if (state) {
          columnApi.applyColumnState({ state, applyOrder: true });
        }
      }
    },
    [onGridReady, persistState, gridId],
  );

  const handleEvents = useColumnState({
    persistState,
    gridId,
    onColumnMoved,
    onColumnResized,
    onColumnVisible,
    onColumnPinned,
    onSortChanged,
    onColumnPivotChanged,
    onColumnRowGroupChanged,
    onColumnValueChanged,
  });
  // useRowData({ rowData, gridApi: gridApiRef.current, gridReady });
  return (
    <AgGridReact
      onGridReady={handleGridReady}
      onRowClicked={handleRowClicked}
      suppressDragLeaveHidesColumns
      // @ts-ignore
      disableStaticMarkup
      rowData={rowData}
      enableCellTextSelection
      reactUi
      // @ts-ignore
      {...props}
      {...handleEvents}
      gridOptions={{
        applyColumnDefOrder: true,
        floatingFiltersHeight: 40,
        headerHeight: 40,
        rowHeight: 60,
        tooltipShowDelay: 300,
        immutableData: true,
        getRowNodeId: (data: any) => data.id,
        ...defaultGridOptions,
        ...gridOptions,
        components: {
          ...gridOptions.components,
          ...(components || {}),
        },
        animateRows: true,
        context: get(gridOptions, 'context', {}),
        defaultColDef: {
          sortable: true,
          resizable: true,
          minWidth: 50,
        },
      }}
    />
  );
};

export default Grid;
