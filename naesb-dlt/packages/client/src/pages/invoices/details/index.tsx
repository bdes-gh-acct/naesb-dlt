/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Grid,
  Skeleton,
  Divider,
} from '@mui/material';
import numeral from 'numeral';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { useInvoice } from '@query/invoices';
import { formatDate } from '@react/toolkit';
import { InvoiceDetailsGrid } from './DetailsGrid';

export const InvoiceDetails = () => {
  const { channelId, invoiceId } = useParams<{
    channelId: string;
    invoiceId: string;
  }>();
  const { data: invoice } = useInvoice(invoiceId);
  const totalValue = invoice?.Details?.reduce((sum: number, detail) => {
    return (
      sum +
      // @ts-ignore
      (detail.Trade?.Type === 'Sell'
        ? detail.Quantity
        : -Math.abs(detail.Quantity)) *
        detail.Price
    );
  }, 0);
  const netVolume = invoice?.Details?.reduce((sum: number, detail) => {
    return (
      sum +
      // @ts-ignore
      (detail.Trade?.Type === 'Sell'
        ? detail.Quantity
        : -Math.abs(detail.Quantity))
    );
  }, 0);
  return (
    <Container maxWidth={false} sx={{ flexGrow: 1, height: '100%' }}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" component={RouterLink} to="/">
          Home
        </Link>{' '}
        <Link
          underline="hover"
          color="inherit"
          component={RouterLink}
          to="/channels"
        >
          Channels
        </Link>{' '}
        <Link
          underline="hover"
          color="inherit"
          component={RouterLink}
          to={`/channels/${channelId}/invoice`}
        >
          {channelId}
        </Link>
        <Typography color="text.primary">Invoice: {invoiceId}</Typography>
      </Breadcrumbs>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mt={2}
        mb={3}
      >
        <Typography variant="h4">Invoice Details</Typography>
      </Box>
      <Box display="flex" alignItems="center">
        {/* <Box mx={1}>
          <Logo trade={trade} />
        </Box> */}
        <Box mx={1}>
          <Typography variant="h4">
            {invoice ? invoice.Name : <Skeleton />}
          </Typography>
          <Box display="flex" alignItems="center">
            {invoice ? (
              <>
                <Typography sx={{ lineHeight: '24px' }}>
                  {invoice.InvoiceId ? (
                    invoice.InvoiceId
                  ) : (
                    <Skeleton width={80} />
                  )}
                </Typography>
                <Typography
                  color="textSecondary"
                  sx={{ marginX: 0.75, pb: '2px', fontWeight: 500 }}
                >
                  |
                </Typography>
                <Typography>
                  {`${formatDate(
                    invoice.InvoicePeriodStart,
                    undefined,
                    true,
                  )} - ${formatDate(
                    invoice.InvoicePeriodEnd,
                    undefined,
                    true,
                  )}`}
                </Typography>
              </>
            ) : (
              <Typography>
                <Skeleton width={300} />
              </Typography>
            )}
          </Box>
        </Box>
      </Box>
      {invoice?.Comments && (
        <Box pb={3} mt={2}>
          <Typography>Comments: {invoice.Comments}</Typography>
        </Box>
      )}
      <Box pb={3} mt={5}>
        <Grid container spacing={3}>
          <Grid item>
            <Typography variant="h3">
              {invoice ? (
                `${numeral(totalValue).format('$0,0[.]00')}`
              ) : (
                <Skeleton />
              )}
            </Typography>
            <Typography variant="overline" color="textSecondary">
              Total Value
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h3">
              {invoice ? (
                `${invoice.Details?.reduce((sum: number, detail) => {
                  return (sum + detail.Quantity) as number;
                }, 0)}`
              ) : (
                <Skeleton />
              )}
            </Typography>
            <Typography variant="overline" color="textSecondary">
              Gross Volume
            </Typography>
          </Grid>
          <Grid item>
            <Typography variant="h3">
              {invoice ? -(netVolume || 0) : <Skeleton />}
            </Typography>
            <Typography variant="overline" color="textSecondary">
              Net Volume
            </Typography>
          </Grid>
        </Grid>
      </Box>
      <Divider />
      <InvoiceDetailsGrid data={invoice?.Details} />
    </Container>
  );
};
