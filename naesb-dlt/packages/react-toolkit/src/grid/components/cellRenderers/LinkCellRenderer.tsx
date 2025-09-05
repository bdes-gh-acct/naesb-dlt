import { ICellRendererParams } from 'ag-grid-community';
import { forwardRef } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { Link } from '@mui/material';

import useCellRendererRef from '../../useCellRendererRef';

export type LinkCellParams = {
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

export type LinkCellRendererParams = ICellRendererParams & LinkCellParams;

export const LinkCellRenderer = forwardRef(
  (params: LinkCellRendererParams, ref) => {
    const { value, data, buildRoute, node, valueFormatted } =
      useCellRendererRef<LinkCellRendererParams>(ref, params);
    const routeParams = useParams();
    return node.group ? (
      <>{value}</>
    ) : (
      <Link
        component={RouterLink}
        to={buildRoute({ value, data, routeParams }) || ''}
      >
        {valueFormatted}
      </Link>
    );
  },
);
