import { AgGridReact } from 'ag-grid-react';
import { Box } from '@mui/joy';
import { GridReadyEvent } from 'ag-grid-community';
import { useCallback } from 'react';
import { DataGridProps } from './types';

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
    <Box
      className="ag-theme-material"
      width={domLayout === 'normal' ? '100%' : undefined}
      height={domLayout === 'normal' ? '100%' : undefined}
    >
      <AgGridReact<TData>
        floatingFiltersHeight={44}
        {...props}
        domLayout={domLayout}
        onGridReady={onGridReady}
      />
    </Box>
  );
};
