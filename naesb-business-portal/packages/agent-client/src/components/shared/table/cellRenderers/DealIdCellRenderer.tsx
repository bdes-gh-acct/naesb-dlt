import { ICellRendererParams } from 'ag-grid-community';
import { forwardRef } from 'react';
import { ITradeViewModel } from '@naesb/dlt-model';
import Link from 'components/shared/link';
import { useParams } from '@tanstack/router';
import { Box, Typography } from '@mui/joy';
import { useCellRendererRef } from '../hooks';

export const DealIdCellRenderer = forwardRef(
  // @ts-ignore
  (
    params: ICellRendererParams<ITradeViewModel> & {
      to?: string | ((params: { params: any }) => string);
    },
    ref,
  ) => {
    const { value, data, to, node } = useCellRendererRef<
      ICellRendererParams<ITradeViewModel> & {
        to?: string | ((params: { params: any }) => string);
      }
    >(ref, params);
    const routeParams = useParams();
    if (node.rowPinned === 'bottom') {
      return <>{value}</>;
    }
    if (data?.OrgDealId) {
      return (
        <Box width="100%" height="100%" display="flex" alignItems="center">
          <Box>
            <Box lineHeight={1.2}>
              {to ? (
                // @ts-ignore *
                <Link
                  sx={{ lineHeight: 1 }}
                  to={typeof to === 'string' ? to : to({ params: routeParams })}
                  params={{ ...routeParams, tradeId: data?.DealId }}
                >
                  {data.OrgDealId}
                </Link>
              ) : (
                <Typography> {data.OrgDealId}</Typography>
              )}
            </Box>
            <Typography sx={{ fontSize: 8 }}> {value}</Typography>
          </Box>
        </Box>
      );
    }
    return (
      (to ? (
        // @ts-ignore
        <Link
          sx={{ lineHeight: 1 }}
          to={typeof to === 'string' ? to : to({ params: routeParams })}
          params={{ ...routeParams, tradeId: data?.DealId }}
        >
          {value}
        </Link>
      ) : (
        <Typography> {data?.DealId}</Typography>
      )) || <></>
    );
  },
);
