import { AgGridReact } from 'ag-grid-react';
import { GridReadyEvent } from 'ag-grid-community';
import { Box } from '@mui/joy';
import { useCallback } from 'react';
import { DataGridProps } from './types';
import './styles.scss';

export const DataGrid = <TData extends object>({
  domLayout = 'autoHeight',
  onGridReady: outerOnGridReady,
  ...props
}: DataGridProps<TData>) => {
  const onGridReady = useCallback(
    (event: GridReadyEvent) => {
      event.api.sizeColumnsToFit();
      if (outerOnGridReady) {
        outerOnGridReady(event);
      }
    },
    [outerOnGridReady],
  );
  return (
    <Box className="ag-theme-material">
      <AgGridReact<TData>
        floatingFiltersHeight={44}
        {...props}
        domLayout={domLayout}
        onGridReady={onGridReady}
      />
    </Box>
  );
};
