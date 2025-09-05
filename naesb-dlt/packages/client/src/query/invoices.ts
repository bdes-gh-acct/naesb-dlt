import {
  ICreateInvoiceRequest,
  IInvoice,
  IQueryResult,
} from '@naesb/dlt-model';
import { useQueryClient, UseQueryOptions } from 'react-query';
import { AxiosError } from 'axios';
import { useAuthorizedMutation } from './useAuthorizedMutation';
import {
  useAuthorizedQuery,
  useAuthorizedSearchQuery,
} from './useAuthorizedQuery';

export const INVOICES_KEY = 'INVOICES';

export const useInvoice = (invoiceId: string) =>
  useAuthorizedQuery<IInvoice>(
    [INVOICES_KEY, invoiceId],
    `/api/ledger/v1/explorer/invoices/${invoiceId}`,
  );

// TODO Define query type
export const useSearchInvoices = (
  params: any = {},
  options?: UseQueryOptions<
    IQueryResult<IInvoice>,
    AxiosError,
    IQueryResult<IInvoice>
  >,
) =>
  useAuthorizedSearchQuery<IQueryResult<IInvoice>>(
    [INVOICES_KEY, 'search', params],
    `/api/ledger/v1/explorer/invoices/search`,
    params,
    {
      ...(options || {}),
    },
  );

export const useCreateInvoice = (onSuccess: () => void) => {
  const queryClient = useQueryClient();
  return useAuthorizedMutation<
    ICreateInvoiceRequest & { ChannelId: string },
    IInvoice
  >(({ ChannelId }) => `/api/ledger/v1/channels/${ChannelId}/invoices`, {
    onSuccess: () => {
      queryClient.invalidateQueries([INVOICES_KEY]);
      onSuccess();
    },
  });
};
