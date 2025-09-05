import { ICellRendererParams } from 'ag-grid-community';
import { forwardRef } from 'react';
import { IDelivery } from '@naesb/dlt-model';
import Link from 'components/shared/link';
import { useParams } from '@tanstack/router';
import { Box, Typography } from '@mui/joy';
import { useCellRendererRef } from '../hooks';

export const DeliveryIdCellRenderer = forwardRef(
  // @ts-ignore
  (
    params: ICellRendererParams<IDelivery> & {
      to?: string | ((params: { params: any }) => string);
    },
    ref,
  ) => {
    const { value, data, to } = useCellRendererRef<
      ICellRendererParams<IDelivery> & {
        to?: string | ((params: { params: any }) => string);
      }
    >(ref, params);
    const routeParams = useParams();
    if (data?.TspDeliveryId) {
      return (
        <Box width="100%" height="100%" display="flex" alignItems="center">
          <Box>
            <Box lineHeight={1.2}>
              {to ? (
                // @ts-ignore *
                <Link
                  sx={{ lineHeight: 1 }}
                  to={typeof to === 'string' ? to : to({ params: routeParams })}
                  params={{ ...routeParams, deliveryId: data?.DeliveryId }}
                >
                  {data.TspDeliveryId}
                </Link>
              ) : (
                <Typography> {data.TspDeliveryId}</Typography>
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
          params={{ ...routeParams, deliveryId: data?.DeliveryId }}
        >
          {data?.DeliveryId}
        </Link>
      ) : (
        <Typography> {data?.DeliveryId}</Typography>
      )) || <></>
    );
  },
);
