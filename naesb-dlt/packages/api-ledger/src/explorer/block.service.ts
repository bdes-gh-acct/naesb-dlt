import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryResultDto } from '@shared/server-utils';
import { FindManyOptions, Repository } from 'typeorm';
import { Block } from '../db/block.entity';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(Block)
    private blockRepository: Repository<Block>,
  ) {}

  async findMany(
    options: FindManyOptions<Block>,
  ): Promise<QueryResultDto<Block>> {
    const [data, totalRecords] = await this.blockRepository.findAndCount(
      options,
    );
    return new QueryResultDto<Block>({ data, totalRecords });
  }

  async findOne(id: string): Promise<Block | null> {
    return this.blockRepository.findOne({ where: { hash: id } });
  }
}
