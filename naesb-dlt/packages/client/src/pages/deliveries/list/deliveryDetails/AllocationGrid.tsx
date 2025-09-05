import { performanceFormatter, performanceTypeFormatter } from '@common/grid';
import { EditableCellRenderer, Grid } from '@react/toolkit';
import { Button, Box } from '@mui/material';
import {
  CellValueChangedEvent,
  ColDef,
  GroupColDef,
  CellClassParams,
  GridOptions,
} from 'ag-grid-community';
import { FORM_ERROR } from 'final-form';
import { get } from 'lodash';
import { FC } from 'react';
import { useForm, useFormState } from 'react-final-form';
import { useFieldArray } from 'react-final-form-arrays';

const columnDefs = (
  errors: any,
  isFooter?: boolean,
): Array<ColDef | GroupColDef> => [
  {
    headerName: 'TRADE DETAILS',
    children: [
      { field: 'DealId', headerName: 'ID' },
      { field: 'OrgDealId', headerName: 'Org Deal ID' },
      { field: 'CounterpartyDealId', headerName: 'Counterparty ID' },
      { field: 'Type', headerName: 'Type', width: 90 },
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
    ],
  },
  {
    headerName: 'ALLOCATION',
    children: [
      {
        headerName: 'Delivery',
        field: 'Allocation',
        editable: !isFooter,
        cellRendererFramework: EditableCellRenderer,
        cellRendererParams: {
          scope: 'trades',
        },
        // TODO fix error for footer
        cellClass: ({ rowIndex, colDef }: CellClassParams) => {
          if (isFooter && get(errors, FORM_ERROR)) {
            return 'custom-ag-editable custom-ag-error';
          }
          if (get(errors, `trades[${rowIndex}].${colDef?.field}`)) {
            return `custom-ag-editable ${isFooter ? '' : 'custom-ag-error'}`;
          }
          return isFooter ? '' : 'custom-ag-editable';
        },
      },
    ],
  },
];

const topGridOptions: GridOptions = {
  domLayout: 'autoHeight',
  immutableData: true,
  alignedGrids: [],
  suppressHorizontalScroll: true,
};

const bottomGridOptions: GridOptions = {
  domLayout: 'autoHeight',
  immutableData: true,
  alignedGrids: [],
};

topGridOptions.alignedGrids?.push(bottomGridOptions);
bottomGridOptions.alignedGrids?.push(topGridOptions);

export const AllocationGrid: FC = () => {
  const { change } = useForm();
  const { errors } = useFormState({
    subscription: { error: true, errors: true },
  });
  const {
    fields: { value },
  } = useFieldArray<Array<any>>('trades', {
    subscription: { value: true, error: true },
  });
  return (
    <>
      <Grid
        onCellValueChanged={(event: CellValueChangedEvent) => {
          change(
            `trades[${event.rowIndex}].Allocation`,
            Number(event.newValue),
          );
        }}
        gridOptions={topGridOptions}
        rowData={value}
        columnDefs={columnDefs(errors)}
        getRowNodeId={(data) => data.DealId}
        stopEditingWhenCellsLoseFocus
      />
      <Grid
        gridOptions={bottomGridOptions}
        rowData={[
          {
            DealId: 'Total',
            Allocation: value?.reduce(
              (acc: number, trade: any) => acc + (trade.Allocation || 0),
              0,
            ),
          },
        ]}
        columnDefs={columnDefs(errors, true)}
        headerHeight={0}
        getRowNodeId={(data) => data.DealId}
        stopEditingWhenCellsLoseFocus
      />
      <Box mt={2}>
        <Button type="submit" variant="contained">
          Save
        </Button>
      </Box>
    </>
  );
};
