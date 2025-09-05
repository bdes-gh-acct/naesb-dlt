/* eslint-disable @typescript-eslint/no-inferrable-types */
import {
  Context,
  Contract,
  Info,
  Returns,
  Transaction,
} from 'fabric-contract-api';
import { Invoice } from './Invoice';
import { InvoiceDetail } from './InvoiceDetail';
import { processResultset } from './util';

const INVOICE_DETAIL = 'InvoiceDetail';
const INVOICE = 'Invoice';

@Info({ title: 'InvoiceContract', description: 'NAESB Invoice Contract' })
export class InvoiceContract extends Contract {
  private nonAdminCommands = [
    'init',
    'InvoiceContract:exists',
    'InvoiceContract:createInvoice',
    'InvoiceContract:getInvoiceDetail',
    'InvoiceContract:createInvoiceDetail',
    'InvoiceContract:updateInvoiceDetail',
  ];

  private adminCommands = [
    'init',
    'InvoiceContract:exists',
    'InvoiceContract:getInvoiceDetail',
  ];

  constructor() {
    super('InvoiceContract');
  }

  public async beforeTransaction(ctx: Context) {
    const tx = ctx.stub.getFunctionAndParameters().fcn;
    const mspId = ctx.clientIdentity.getMSPID();
    if (mspId !== 'D000000000' && !this.nonAdminCommands.includes(tx)) {
      throw new Error(
        `The participant belonging to MSP: ${mspId} cannot invoke transaction: ${tx}`,
      );
    } else if (mspId === 'D000000000' && !this.adminCommands.includes(tx)) {
      throw new Error(
        `The participant belonging to MSP: ${mspId} cannot invoke transaction: ${tx}`,
      );
    }
  }

  /**
   * Perform any setup of the ledger that might be required
   * @param {Context} ctx the transaction context
   */
  @Transaction()
  public async init(ctx: Context) {
    console.log('Upgrading the delivery contract');
  }

  @Transaction(false)
  @Returns('boolean')
  public async exists(ctx: Context, key: string): Promise<boolean> {
    const buffer = await ctx.stub.getState(key);
    return !!buffer && buffer.length > 0;
  }

  @Transaction()
  @Returns('Invoice')
  public async createInvoice(ctx: Context, input: string): Promise<Invoice> {
    const inputJSON = JSON.parse(input) as any;
    const {
      InvoiceId,
      Name,
      Comments,
      InvoicePeriodEnd,
      InvoicePeriodStart,
      Details,
    } = inputJSON;
    const key = ctx.stub.createCompositeKey(INVOICE, [InvoiceId]);
    const exists = await this.exists(ctx, key);
    if (exists) {
      throw new Error(`Invoice with InvoiceId ${key} already exists`);
    }
    const invoice = new Invoice();
    invoice.InvoicePeriodStart = InvoicePeriodStart;
    invoice.InvoiceId = InvoiceId;
    invoice.InvoicePeriodEnd = InvoicePeriodEnd;
    invoice.Name = Name;
    invoice.Comments = Comments;
    invoice.Revision = 0;
    const stateBuffer = Buffer.from(JSON.stringify(invoice));
    await ctx.stub.putState(key, stateBuffer);
    const invoiceDetails = await Promise.all(
      Details.map((detail: any) =>
        this.saveInvoiceDetail(ctx, InvoiceId, { ...detail, InvoiceId }),
      ),
    );
    const result = { ...invoice, Details: invoiceDetails };
    const eventBuffer = Buffer.from(JSON.stringify(result));
    await ctx.stub.setEvent('InvoiceEvent', eventBuffer);
    return result;
  }

  @Transaction()
  @Returns('InvoiceDetail')
  public async createInvoiceDetail(
    ctx: Context,
    input: string,
  ): Promise<InvoiceDetail> {
    const inputJSON = JSON.parse(input) as any;
    const { DealId, InvoiceId, AllocationId, Price, Quantity, Date } =
      inputJSON;
    const detail = await this.saveInvoiceDetail(ctx, InvoiceId, {
      DealId,
      AllocationId,
      Price,
      Quantity,
      Date,
      InvoiceId,
    } as InvoiceDetail);
    const buffer = Buffer.from(JSON.stringify(detail));
    await ctx.stub.setEvent('InvoiceDetailEvent', buffer);
    return detail;
  }

  private async saveInvoiceDetail(
    ctx: Context,
    InvoiceId: string,
    detail: InvoiceDetail,
  ) {
    const detailKey = ctx.stub.createCompositeKey(INVOICE_DETAIL, [
      InvoiceId,
      detail.AllocationId,
    ]);
    const exists = await this.exists(ctx, detailKey);
    if (exists) {
      throw new Error(`Invoice Detail for ${detailKey} already exists`);
    }
    const result = new InvoiceDetail();
    result.Date = detail.Date;
    result.InvoiceId = InvoiceId;
    result.AllocationId = detail.AllocationId;
    result.Price = detail.Price;
    result.Quantity = detail.Quantity;
    result.DealId = detail.DealId;
    result.Revision = 0;
    const buffer = Buffer.from(JSON.stringify(detail));
    await ctx.stub.putState(detailKey, buffer);
    return result;
  }

  @Transaction(false)
  @Returns('InvoiceDetail[]')
  public async listInvoiceDetails(
    ctx: Context,
    request: string,
  ): Promise<InvoiceDetail[]> {
    const { pageSize = 100, bookmark } = JSON.parse(request);
    const resultSet = await ctx.stub.getStateByRangeWithPagination(
      INVOICE_DETAIL,
      INVOICE_DETAIL,
      pageSize,
      bookmark,
    );
    return await processResultset(resultSet.iterator);
  }

  @Transaction(false)
  @Returns('InvoiceDetail')
  public async getInvoiceDetail(
    ctx: Context,
    InvoiceId: string,
    AllocationId: string,
  ): Promise<InvoiceDetail> {
    const detailKey = ctx.stub.createCompositeKey(INVOICE_DETAIL, [
      InvoiceId,
      AllocationId,
    ]);
    const exists = await this.exists(ctx, detailKey);
    if (!exists) {
      throw new Error(`The invoice detail for ${detailKey} does not exist`);
    }
    const buffer = await ctx.stub.getState(detailKey);
    const delivery = JSON.parse(buffer.toString()) as InvoiceDetail;
    return delivery;
  }
}
