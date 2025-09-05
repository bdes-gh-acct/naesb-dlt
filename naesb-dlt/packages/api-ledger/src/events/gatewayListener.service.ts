/* eslint-disable no-await-in-loop */
/* eslint-disable @typescript-eslint/naming-convention */
import { Inject, Injectable } from '@nestjs/common';
import { logger } from '@shared/server-utils';
import { Gateway } from '@hyperledger/fabric-gateway';
import { ModuleRef } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { LedgerService } from '../ledger/ledger.service';
import { CheckpointService } from './checkpoint.service';
import { assertDefined } from './util';
import { ChaincodeCheckpointService } from './chaincodeCheckpoint.service';
import { parseBlock, createTransactionBlock } from './blockUtil';
import { env } from '../env';
import { channel } from 'diagnostics_channel';

@Injectable()
export class GatewayListenerService {
  constructor(
    private readonly ledgerService: LedgerService,
    private moduleRef: ModuleRef,
    @Inject(env.KAFKA_CLIENT_NAME) private client: ClientProxy,
  ) {}

  async createChannelEventHub(channel_id: string) {
    // Create channel event hub
    try {
      const gateway = this.ledgerService.getAdminGateway();
      const network = (gateway as Gateway).getNetwork(channel_id);
      const checkpointer = await this.moduleRef.resolve(CheckpointService);
      checkpointer.setChannelId(channel_id);
      const latestBlock = await checkpointer.getBlockNumber();
      const latestTransaction = latestBlock
        ? await checkpointer.getTransaction(latestBlock)
        : undefined;
      const blocks = await network.getBlockEvents({
        checkpoint: {
          getBlockNumber: () => latestBlock,
          getTransactionId: () => latestTransaction,
        },
        startBlock: BigInt(0), // Used only if there is no checkpoint block number
      });
      console.log(`Starting channel events with block ${latestBlock}`);
      try {
        // eslint-disable-next-line no-restricted-syntax
        for await (const block of blocks) {
          const header = assertDefined(
            block.getHeader(),
            'Missing block header',
          );
          const blockNumber = BigInt(header.getNumber());
          const parsedBlock = parseBlock(block);
          console.log(
            `Block ${parsedBlock.header?.number} on channel ${channel_id} received`,
          );
          console.log(JSON.stringify(parsedBlock));
          this.client.emit(
            `${env.KAFKA_CLIENT_NAME}.ledger.event.block`,
            JSON.stringify({ event: parsedBlock, channel_id }),
          );
          console.log(`Emitting the parsed block event`);
          parsedBlock.data.data.forEach((value) =>
            console.log(
              value.channelHeader?.type,
              value.isValid,
              value.transactionActions,
            ),
          );
          console.log(`Emitted the parsed block event`);
          const validTransactionList = parsedBlock.data.data.filter(
            (item) => item.isValid,
          );
          // eslint-disable-next-line no-restricted-syntax
          console.log(`Valid transactions in block: ${validTransactionList.length}`);
          console.log(`Valid transaction list:`);
          console.log(JSON.stringify(validTransactionList));
          console.log(`Emitting the transaction events`);
          console.log(`Parsed block data:`);
          console.log(JSON.stringify(parsedBlock.header));
          const blockHeader = parsedBlock.header;
          for (const transaction of validTransactionList) {
            console.log(JSON.stringify(transaction));
            const transactionBlock = createTransactionBlock(
              blockHeader,
              transaction,
            );
            console.log(`Transaction block:`);
            console.log(JSON.stringify({transactionBlock, channel_id}));
            this.client.emit(
              `${env.KAFKA_CLIENT_NAME}.ledger.event.transaction`,
              JSON.stringify({channel_id, transaction: transactionBlock}),
            );
          console.log(`Emitted the transaction events`);

            // eslint-disable-next-line no-restricted-syntax
            for (const action of transaction.transactionActions || []) {
              if (action.event) {
                this.client.emit(
                  `${env.KAFKA_CLIENT_NAME}.ledger.event.contract.${action.event.Name}`,
                  JSON.stringify({ event: action.event, channel_id }),
                );
              }
            }
            await checkpointer.checkpointTransaction(
              blockNumber,
              transaction.channelHeader.txnId,
            );
          }
          await checkpointer.checkpointBlock(blockNumber);
        }
      } finally {
        blocks.close();
      }
      logger.info(`Successfully created channel event hub for ${channel_id}`);
    } catch (error) {
      const err = error as Error;
      logger.error(
        `Failed to add block listener for ${channel_id}. Error: ${err.name}, ${err.message}, ${err.stack}`,
      );
    }
  }

  async createChannelContractEventHub(channel_id: string, chaincode: string) {
    console.log(
      `Creating event hub for chaincode ${chaincode} on channel ${channel_id}`,
    );
    // Create channel event hub
    try {
      const gateway = this.ledgerService.getAdminGateway();
      const network = (gateway as Gateway).getNetwork(channel_id);
      const checkpointer = await this.moduleRef.resolve(
        ChaincodeCheckpointService,
      );
      checkpointer.setChannelId(channel_id);
      checkpointer.setChaincodeId(chaincode);
      const latestBlock = await checkpointer.getBlockNumber();
      const latestTransaction = latestBlock
        ? await checkpointer.getTransaction(latestBlock)
        : undefined;
      const chaincodeEvents = await network.getChaincodeEvents(chaincode, {
        checkpoint: {
          getBlockNumber: () => latestBlock,
          getTransactionId: () => latestTransaction,
        },
        startBlock: BigInt(0), // Used only if there is no checkpoint block number
      });
      console.log(`Starting events with block ${latestBlock}`);
      try {
        // eslint-disable-next-line no-restricted-syntax
        for await (const chaincodeEvent of chaincodeEvents) {
          this.client.emit(
            `${env.KAFKA_CLIENT_NAME}.ledger.event.chaincode`,
            JSON.stringify({
              event: chaincodeEvent,
              channel_id,
            }),
          );

          await checkpointer.checkpointChaincodeEvent(chaincodeEvent);
        }
      } finally {
        chaincodeEvents.close();
      }
      logger.info(
        `Successfully created chaincode channel event hub for ${channel_id}:${chaincode}`,
      );
    } catch (error) {
      const err = error as Error;
      logger.error(
        `Failed to add block listener for ${channel_id}. Error: ${err.name}, ${err.message}, ${err.stack}`,
      );
    }
  }
}
