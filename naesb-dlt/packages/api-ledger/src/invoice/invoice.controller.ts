/* eslint-disable import/no-extraneous-dependencies */
import {
  BadRequestException,
  Body,
  Controller,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import {
  ICreateInvoiceDetailRequest,
  ICreateInvoiceRequest,
} from '@naesb/dlt-model';
import { Request } from 'express';
import { v4 } from 'uuid';
import { InvoiceService } from './invoice.service';

@ApiTags('Invoices')
@Controller('channels/:channelId/invoices')
export class InvoiceController {
  constructor(private readonly invoiceService: InvoiceService) {}

  @Post(':invoiceId/details')
  async createInvoiceDetail(
    @Body() body: Omit<ICreateInvoiceDetailRequest, 'InvoiceId'>,
    @Param()
    { channelId, invoiceId }: { channelId: string; invoiceId: string },
    @Req() { user }: Request,
  ) {
    const response = await this.invoiceService.createInvoiceDetail(
      { InvoiceId: invoiceId, ...body },
      channelId,
      user.sub,
    );
    if (response.success) {
      return response;
    }
    throw new BadRequestException(response);
  }

  @Post('')
  async createInvoice(
    @Body() body: ICreateInvoiceRequest,
    @Param()
    { channelId }: { channelId: string },
    @Req() { user }: Request,
  ) {
    const InvoiceId = v4();
    const response = await this.invoiceService.createInvoice(
      { ...body, InvoiceId },
      channelId,
      user.sub,
    );
    if (response.success) {
      return response;
    }
    throw new BadRequestException(response);
  }
}
