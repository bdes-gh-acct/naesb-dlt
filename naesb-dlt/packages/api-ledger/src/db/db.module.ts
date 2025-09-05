/* eslint-disable import/no-extraneous-dependencies */
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Block } from './block.entity';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Transaction } from './transaction.entity';
import { Trade } from './trade.entity';
import { Delivery } from './delivery.entity';
import { DeliveryAllocation } from './deliveryAllocation.entity';
import { Channel } from './channel.entity';
import { ChannelMember } from './channelMember.entity';
import { InvoiceDetail } from './invoiceDetail.entity';
import { Invoice } from './invoice.entity';
import { BlockCheckpoint } from './blockCheckpoint.entity';
import { TransactionCheckpoint } from './transactionCheckpoint.entity';
import { ChaincodeBlockCheckpoint } from './chaincodeBlockCheckpoint.entity';
import { ChaincodeTransactionCheckpoint } from './chaincodeTransactionCheckpoint.entity';
import { env } from '../env';
import { Chaincode } from './chaincode.entity';
import { BaseContract } from './baseContract.entity';
import { TradeFacility } from './tradeFacility.entity';
import { ChannelFacility } from './facility.entity';

const { DB_PORT, DB_HOST, DB_USERNAME, DB_PASSWORD, DB_DATABASE, DB_SCHEMA } =
  env;

@Module({
  imports: [
    TypeOrmModule.forRoot({
      autoLoadEntities: true,
      type: 'postgres',
      port: DB_PORT,
      host: DB_HOST,
      username: DB_USERNAME,
      password: DB_PASSWORD,
      database: DB_DATABASE,
      schema: DB_SCHEMA,
      logging: ['error'],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([
      Block,
      Chaincode,
      Transaction,
      BlockCheckpoint,
      ChaincodeBlockCheckpoint,
      ChaincodeTransactionCheckpoint,
      TransactionCheckpoint,
      Trade,
      Delivery,
      DeliveryAllocation,
      Channel,
      ChannelMember,
      InvoiceDetail,
      Invoice,
      BaseContract,
      TradeFacility,
      ChannelFacility,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DbModule {}
