import { ICellRendererParams } from 'ag-grid-community';
import { forwardRef } from 'react';
import { get } from 'lodash';
import { Box, Tooltip } from '@mui/material';
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import { useFormState } from 'react-final-form';
import useCellRendererRef from '../../useCellRendererRef';

export type EditableCellRendererParams = ICellRendererParams & {
  scope: string;
};

export const EditableCellRenderer = forwardRef(
  (params: EditableCellRendererParams, ref) => {
    const { value, rowIndex, colDef, scope, node, valueFormatted } =
      useCellRendererRef<EditableCellRendererParams>(ref, params);
    const { errors } = useFormState({ subscription: { errors: true } });
    const error = get(errors, `${scope}[${rowIndex}].${colDef?.field}`);
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
          <Tooltip title={error}>
            <ErrorIcon sx={{ marginLeft: 1 }} color="error" />
          </Tooltip>
        )}
      </Box>
    );
  },
);
