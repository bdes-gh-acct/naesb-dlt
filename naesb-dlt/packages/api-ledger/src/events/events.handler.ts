/* eslint-disable @typescript-eslint/naming-convention */
import { Controller, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { logger } from '@shared/server-utils';
import { Repository } from 'typeorm';
import { EventPattern } from '@nestjs/microservices';
import { Block } from '../db/block.entity';
import { Transaction } from '../db/transaction.entity';
import { Channel } from '../db/channel.entity';
import { ChannelMember } from '../db/channelMember.entity';
import { PeerService } from '../peer/peer.service';
import { GatewayListenerService } from './gatewayListener.service';
import { IBlockEvent, IBlockHeader, ITransaction, ITransactionBlock } from './blockUtil';
import { env } from '../env';

@Injectable()
@Controller('LedgerEvents')
export class EventsController {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    @InjectRepository(ChannelMember)
    private channelMemberRepository: Repository<ChannelMember>,
    private readonly peerService: PeerService,
    private readonly gatewayListenerService: GatewayListenerService,
  ) {}

  @EventPattern(`${env.KAFKA_CLIENT_NAME}.ledger.event.block`)
  async handleBlockEvent({
    channel_id,
    event,
  }: {
    event: IBlockEvent;
    channel_id: string;
  }) {
    // handle and process "OrderCreatedEvent" event
    await this.blockRepository.save(
      this.blockRepository.create({
        block_number: event.header?.number,
        hash: event.header?.hash,
        previous_hash: event.header?.previousHash,
        transactionCount:
          event.data?.data?.filter((transaction) => transaction.isValid)
            .length || 0,
      }),
    );
    logger.info(
      `Block ${event.header?.number} on channel ${channel_id} processed`,
    );
  }

  @EventPattern(`${env.KAFKA_CLIENT_NAME}.ledger.event.channel`)
  async handleChannelEvent({ channel_id }: { channel_id: string }) {
    const msps = await this.peerService.getChannelDetails(channel_id);
    await this.channelRepository.update(channel_id, {
      NetworkStatus: 'Active',
    });
    await Promise.all(
      msps.map((msp) =>
        this.channelMemberRepository.save(
          this.channelMemberRepository.create({
            ChannelId: channel_id,
            MemberId: msp.MSPID,
          }),
        ),
      ),
    );
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.gatewayListenerService.createChannelEventHub(channel_id);
    logger.info(`Channel ${channel_id} processed`);
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  @EventPattern(`${env.KAFKA_CLIENT_NAME}.ledger.event.chaincode`)
  async handleChaincodeEvent({
    channel_id,
    name,
  }: {
    channel_id: string;
    name: string;
  }) {
    logger.info(
      `Processing chaincode event. Channel: ${channel_id}. Chaincode: ${name}`,
    );
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.gatewayListenerService.createChannelContractEventHub(channel_id, name);
    logger.info(
      `Chaincode event processed.  Channel: ${channel_id}. Chaincode: ${name}`,
    );
  }

  @EventPattern(`${env.KAFKA_CLIENT_NAME}.ledger.event.transaction`)
  async handleTransactionEvent({
    channel_id,
    transaction,
  }: {
    channel_id: string;
    transaction: ITransactionBlock;
  }) {
    // handle and process "OrderCreatedEvent" event
    // const transactionId = event.getChannelHeader().getTxId();
    // console.log(
    //   `Transaction ${transactionId} created by ${creator}`,
    //   event.getNamespaceReadWriteSets().flatMap((readWriteSet) => {
    //     const namespace = readWriteSet.getNamespace();
    //     const entries = readWriteSet
    //       .getReadWriteSet()
    //       .getMetadataWritesList()
    //       .map((list) => list.getKey());
    //     return readWriteSet
    //       .getReadWriteSet()
    //       .getWritesList()
    //       .map((write) => ({
    //         channel: event.getChannelHeader().getChannelId(),
    //         namespace,
    //         entries,
    //         metaData: readWriteSet.getReadWriteSet().getMetadataWritesList()
    //           .length,
    //         other: readWriteSet.getReadWriteSet().getRangeQueriesInfoList()
    //           .length,
    //         key: write.getKey(),
    //         isDelete: write.getIsDelete(),
    //         value64: write.getValue_asB64(),
    //         value: new TextDecoder().decode(write.getValue_asU8()),
    //       }));
    //   }),
    // );
    console.log(`Entire transaction data:`, transaction);
    console.log(`Channel ID:`, channel_id);
    const transactionRecord = {
      timestamp: transaction.channelHeader.timestamp,
      channel_id,
      id: transaction.channelHeader.txnId,
      type: transaction.channelHeader.type,
      block_hash: transaction?.hash,
      block_number: transaction?.number,
      signer: transaction.signatureHeader.identity?.commonName,
      signer_role: transaction.signatureHeader.identity?.organizationUnit,
      mspId: transaction.signatureHeader.mspId,
      data: transaction,
      payload: transaction.payload,
    };
    await this.transactionRepository.save(transactionRecord);

    // const transaction = {
    //   timestamp,
    //   channel_id,
    //   id: transactionId,
    //   block_hash: hash,
    //   block_number,
    //   data,
    //   events: events?.map((event) => event.eventName),
    //   creator: get(data, 'header.creator.mspid'),
    //   contract: get(
    //     data,
    //     'payload.action.proposal_response_payload.extension.chaincode_id.name',
    //   ),
    //   contract_version: get(
    //     data,
    //     'payload.action.proposal_response_payload.extension.chaincode_id.version',
    //   )
    // logger.info(((event.getBlockEvent().blockData as BlockEvent).blockData as BlockData).payload)
    // await Promise.all(
    //   transactionData.actions.map((action) =>
    //     this.saveAction(
    //       action,
    //       event.getBlockEvent().blockData,
    //       event.transactionId,
    //       block.hash,
    //       block.block_number,
    //       event.getContractEvents(),
    //     ),
    //   ),
    // );
  }
}