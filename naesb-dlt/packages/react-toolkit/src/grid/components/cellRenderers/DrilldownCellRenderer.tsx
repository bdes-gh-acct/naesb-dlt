import { ICellRendererParams } from 'ag-grid-community';
import { forwardRef } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { IconButton } from '@mui/material';
import VisibilityOutlinedIcon from '@mui/icons-material/MoreVert';
import useCellRendererRef from '../../useCellRendererRef';

export type DrilldownCellParams = {
  buildRoute: ({
    data,
    value,
    routeParams,
  }: {
    data: any;
    value: any;
    routeParams: any;
  }) => string | undefined;
};

export type DrilldownCellRendererParams = ICellRendererParams &
  DrilldownCellParams;

export const DrilldownCellRenderer = forwardRef(
  (params: DrilldownCellRendererParams, ref) => {
    const { value, data, buildRoute, node } =
      useCellRendererRef<DrilldownCellRendererParams>(ref, params);
    const routeParams = useParams();
    return node.group ? (
      <>{value}</>
    ) : (
      <div>
        <IconButton
          size="small"
          component={RouterLink}
          color="inherit"
          to={buildRoute({ value, data, routeParams }) || ''}
        >
          <VisibilityOutlinedIcon />
        </IconButton>
      </div>
    );
  },
);
