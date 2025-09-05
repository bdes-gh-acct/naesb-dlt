import { ICellRendererParams } from 'ag-grid-community';
import { forwardRef, useMemo } from 'react';
import { get } from 'lodash';
import { Box, Tooltip } from '@mui/material';
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import { useFormState } from 'react-hook-form';
import { useCellRendererRef } from '../hooks';

export type EditableCellRendererParams = ICellRendererParams & {
  scope: string;
};

export const EditableCellRenderer = forwardRef(
  (params: EditableCellRendererParams, ref) => {
    const { value, rowIndex, colDef, scope, node, valueFormatted } =
      useCellRendererRef<EditableCellRendererParams>(ref, params);
    const { errors: innerErrors } = useFormState();
    const error = useMemo(() => {
      return node.rowPinned === 'bottom'
        ? get(innerErrors, `${scope}Bottom`)
        : get(innerErrors, `${scope}.${rowIndex}.${colDef?.field}`);
    }, [innerErrors, scope, rowIndex, colDef, node.rowPinned]);
    return node.group ? (
      <>{valueFormatted || value}</>
    ) : (
      <Box
        display="flex"
        alignItems="center"
        width="100%"
        justifyContent="space-between"
      >
        {valueFormatted || value}{' '}
        {error && (
          <Tooltip title={error?.message as string}>
            <ErrorIcon sx={{ marginLeft: 1 }} color="error" />
          </Tooltip>
        )}
      </Box>
    );
  },
);
