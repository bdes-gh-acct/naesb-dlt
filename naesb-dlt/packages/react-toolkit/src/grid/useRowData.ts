import { GridApi } from 'ag-grid-community';
import { useEffect } from 'react';

export interface UseRowDataParams {
  rowData?: any[];
  gridReady: boolean;
  gridApi?: GridApi;
}

const useRowData = ({ rowData, gridApi, gridReady }: UseRowDataParams) => {
  useEffect(() => {
    if (gridReady && rowData && gridApi) {
      gridApi.setRowData(rowData);
      if (rowData.length === 0) {
        gridApi.hideOverlay();
        gridApi.showNoRowsOverlay();
      }
    } else if (!rowData && gridApi) {
      gridApi.showLoadingOverlay();
    }
  }, [rowData, gridApi, gridReady]);
};

export default useRowData;
