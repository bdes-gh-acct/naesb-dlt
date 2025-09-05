import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ChaincodeEvent, Checkpointer } from '@hyperledger/fabric-gateway';
import { Repository } from 'typeorm';
import { BlockCheckpoint } from '../db/blockCheckpoint.entity';
import { TransactionCheckpoint } from '../db/transactionCheckpoint.entity';
import { ChaincodeBlockCheckpoint } from '../db/chaincodeBlockCheckpoint.entity';
import { ChaincodeTransactionCheckpoint } from '../db/chaincodeTransactionCheckpoint.entity';

@Injectable()
export class CheckpointService
  implements Omit<Checkpointer, 'getBlockNumber' | 'getTransactionId'>
{
  private channelId: string;

  private chainCode: string;

  constructor(
    @InjectRepository(BlockCheckpoint)
    private blockRepository: Repository<BlockCheckpoint>,
    @InjectRepository(TransactionCheckpoint)
    private transactionRepository: Repository<TransactionCheckpoint>,
    @InjectRepository(ChaincodeBlockCheckpoint)
    private chaincodeBlockRepository: Repository<TransactionCheckpoint>,
    @InjectRepository(ChaincodeTransactionCheckpoint)
    private chaincodeTransactionRepository: Repository<ChaincodeTransactionCheckpoint>,
  ) {}

  setChannelId(channelId) {
    this.channelId = channelId;
  }

  setChaincodeId(chaincodeId) {
    this.chainCode = chaincodeId;
  }

  async getBlockNumber(): Promise<bigint | undefined> {
    const transaction = await this.transactionRepository.findOne({
      where: { ChannelId: this.channelId },
    });
    if (!transaction) return undefined;
    const result = BigInt(transaction.BlockId);
    return result;
  }

  async getTransaction(blockNumber: bigint): Promise<string | undefined> {
    console.log(`Getting latest transaction for channel: ${this.channelId}`);
    const checkpoint = await this.transactionRepository.findOne({
      where: { ChannelId: this.channelId, BlockId: Number(blockNumber) },
    });
    return checkpoint?.TransactionId;
  }

  async checkpointBlock(blockNumber: bigint): Promise<void> {
    console.log(`Setting Block: ${blockNumber} for ${this.channelId}`);
    const record = this.blockRepository.create({
      Id: Number(blockNumber) || 0,
      ChannelId: this.channelId,
    });
    await this.blockRepository.save(record);
  }

  async checkpointTransaction(
    blockNumber: bigint,
    transactionId: string,
  ): Promise<void> {
    console.log(`Setting Block: ${blockNumber} for ${this.channelId}`);
    await this.transactionRepository.save({
      TransactionId: transactionId,
      BlockId: Number(blockNumber),
      ChannelId: this.channelId,
    });
  }

  async checkpointChaincodeEvent(event: ChaincodeEvent): Promise<void> {
    console.log(`Setting Block: ${event.blockNumber} for ${this.channelId}`);
    await this.chaincodeTransactionRepository.save({
      ChaincodeId: this.chainCode,
      BlockId: Number(event.blockNumber),
      ChannelId: this.channelId,
      TransactionId: event.transactionId,
    });
    await this.chaincodeBlockRepository.save({
      ChaincodeId: this.chainCode,
      BlockId: Number(event.blockNumber),
      ChannelId: this.channelId,
    });
  }
}
