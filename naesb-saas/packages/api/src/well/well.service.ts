import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { z } from 'zod';
import { IWell } from '@shared/model';
import { Field, Well } from '../db';
import { validate } from '../util/validate';

const wellSchema = (
  fieldRepository: Repository<Field>,
  wellRepository: Repository<Well>,
) =>
  z.object({
    id: z
      .string()
      .refine(
        async (value) =>
          !(await wellRepository.findOne({ where: { id: value } })),
        { message: 'Well already exists' },
      ),
    name: z.string(),
    businessId: z.string(),
    fieldId: z
      .string()
      .optional()
      .refine(
        async (value) =>
          !value ||
          Boolean(await fieldRepository.findOne({ where: { id: value } })),
        { message: 'Field does not exist' },
      ),
  });

@Injectable()
export class WellService {
  constructor(
    @InjectRepository(Well) private readonly wellRepository: Repository<Well>,
    @InjectRepository(Field)
    private readonly fieldRepository: Repository<Field>,
  ) {}

  async findMany(options?: FindManyOptions<Well>) {
    const [data, totalRecords] = await this.wellRepository.findAndCount(
      options,
    );
    return { data, totalRecords };
  }

  async findOne(id: string) {
    return this.wellRepository.findOne({ where: { id } });
  }

  async create(well: IWell) {
    const body = await validate(
      wellSchema(this.fieldRepository, this.wellRepository),
      well as any,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    await this.wellRepository.insert(body);
    return this.wellRepository.find({ where: { id: body.id } });
  }
}
