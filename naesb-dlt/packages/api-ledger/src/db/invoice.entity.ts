import { IInvoice, IInvoiceDetail } from '@naesb/dlt-model';
import { Entity, Column, PrimaryColumn, OneToMany } from 'typeorm';
import { InvoiceDetail } from './invoiceDetail.entity';
import { ColumnNumericTransformer } from './transformer';

@Entity()
export class Invoice implements IInvoice {
  @PrimaryColumn()
  InvoiceId: string;

  @Column()
  Name: string;

  @Column()
  ChannelId: string;

  @Column({ nullable: true })
  Comments: number;

  @Column()
  InvoicePeriodStart: string;

  @Column()
  InvoicePeriodEnd: string;

  @Column()
  Revision: number;

  @Column({ nullable: true })
  GrossVolume: number;

  @Column({ nullable: true })
  NetVolume: number;

  @Column({
    type: 'decimal',
    transformer: new ColumnNumericTransformer(),
    nullable: true,
  })
  Value: number;

  @OneToMany(() => InvoiceDetail, (detail) => detail.Invoice)
  Details?: Array<InvoiceDetail>;
}
