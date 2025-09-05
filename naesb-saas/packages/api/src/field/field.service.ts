import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { z } from 'zod';
import { IWell } from '@shared/model';
import { Field } from '../db';
import { validate } from '../util/validate';

const createFieldSchema = (fieldRepository: Repository<Field>) =>
  z.object({
    id: z
      .string()
      .refine(
        async (value) =>
          !(await fieldRepository.findOne({ where: { id: value } })),
        { message: 'Field already exists' },
      ),
    businessId: z.string(),
    name: z.string(),
  });

@Injectable()
export class FieldService {
  constructor(
    @InjectRepository(Field)
    private readonly fieldRepository: Repository<Field>,
  ) {}

  async findMany(options?: FindManyOptions<Field>) {
    const [data, totalRecords] = await this.fieldRepository.findAndCount(
      options,
    );
    return { data, totalRecords };
  }

  async findOne(id: string) {
    return this.fieldRepository.findOne({ where: { id } });
  }

  async create(well: IWell) {
    const body = await validate(
      createFieldSchema(this.fieldRepository),
      well as any,
    );
    return this.fieldRepository.save(body);
  }
}
