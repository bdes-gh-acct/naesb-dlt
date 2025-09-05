export interface IInvoiceDetail {
  DealId: string;
  InvoiceId: string;
  AllocationId: string;
  Price: number;
  Quantity: number;
  Date: string;
  Revision: number;
}

export interface IInvoice {
  InvoiceId: string;
  Name: string;
  Comments: number;
  InvoicePeriodStart: string;
  InvoicePeriodEnd: string;
  Revision: number;
  Details?: Array<Omit<IInvoiceDetail, 'Revision'>>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ICreateInvoiceDetailRequest
  extends Omit<IInvoiceDetail, 'Revision'> {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ICreateInvoiceRequest extends Omit<IInvoice, 'Revision'> {}
