/* eslint-disable no-underscore-dangle */
import {
  CellValueChangedEvent,
  ColDef,
  ColGroupDef,
  CellClassParams,
} from 'ag-grid-community';
import { get, sumBy } from 'lodash';
import { useEffect, useMemo } from 'react';
import {
  performanceFormatter,
  performanceTypeFormatter,
} from 'components/shared/table/formatters';
import { DataGrid } from 'components/shared/table';
import { useFieldArray, useFormContext } from 'react-hook-form';
import {
  DealIdCellRenderer,
  EditableCellRenderer,
} from 'components/shared/table/cellRenderers';
import { IDelivery } from '@naesb/dlt-model';
import { allocationSchema } from './schema';

const columnDefs = (
  errors: any,
  isFooter?: boolean,
): Array<ColDef | ColGroupDef> => [
  {
    headerName: 'TRADE DETAILS',
    children: [
      {
        field: 'DealId',
        headerName: 'Deal ID',
        cellRenderer: DealIdCellRenderer,
      },
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
        headerName: 'Qty/Day',
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
        field: 'Quantity',
        editable: !isFooter,
        cellRenderer: EditableCellRenderer,
        cellRendererParams: {
          scope: 'Allocations',
        },
        // TODO fix error for footer
        cellClass: ({ rowIndex, colDef }: CellClassParams) => {
          if (isFooter && get(errors, 'API')) {
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

export const AllocationGrid = ({ delivery }: { delivery: IDelivery }) => {
  const { setError, clearErrors } = useFormContext();
  const { update, fields } = useFieldArray({
    name: 'Allocations',
    shouldUnregister: false,
  });
  const totals = useMemo(() => {
    const Quantity = sumBy(
      fields as Array<{ id: string; Quantity: number }>,
      (val) => Number(val.Quantity || 0),
    );
    if (Quantity > (delivery.ActualQuantity || 0)) {
      setError(`AllocationsBottom`, {
        message: 'Total allocation cannot exceed actual delivery quantity',
      });
    } else {
      clearErrors('AllocationsBottom');
    }
    return [{ Quantity, DealId: 'Totals' }];
  }, [delivery.ActualQuantity, fields, setError, clearErrors]);

  useEffect(() => {
    clearErrors('Allocations');
    const schema = allocationSchema;
    const result = schema.safeParse({ trades: fields });
    if (!result.success) {
      const error = result.error.format();
      if (error.Allocations) {
        Object.entries(error.Allocations).forEach(([key, value]) => {
          Object.entries(value).forEach(([innerKey, innerValue]) => {
            if (innerValue._errors?.length) {
              setError(`Allocations.${key}.${innerKey}`, {
                message: innerValue._errors.join(', '),
              });
            }
          });
        });
      }
    }
  }, [setError, delivery, fields, clearErrors]);
  return (
    <DataGrid
      onCellValueChanged={(event: CellValueChangedEvent) => {
        update(event.rowIndex as number, event.node.data);
      }}
      pinnedBottomRowData={totals}
      rowData={fields}
      columnDefs={columnDefs(undefined)}
      getRowId={({ data: innerRowData }) => innerRowData.DealId}
      stopEditingWhenCellsLoseFocus
    />
  );
};
