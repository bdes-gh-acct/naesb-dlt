import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import { IUserOrganization, QueryResult } from '@shared/model';
import { UserOrganization } from '../db';

@Injectable()
export class UserOrganizationService {
  constructor(
    @InjectRepository(UserOrganization)
    private userOrganizationRepository: Repository<UserOrganization>,
  ) {}

  async findMany(
    options?: FindManyOptions<UserOrganization>,
  ): Promise<QueryResult<IUserOrganization>> {
    const [data, totalRecords] =
      await this.userOrganizationRepository.findAndCount({
        ...(options || {}),
      });
    return { data, totalRecords, timestamp: new Date().toISOString() };
  }

  findOne(id: string): Promise<IUserOrganization | null> {
    return this.userOrganizationRepository.findOne({
      where: { businessId: id },
    });
  }

  async create(body: IUserOrganization) {
    await this.userOrganizationRepository.insert(body);
    return this.userOrganizationRepository.findOne({
      where: { businessId: body.businessId, userId: body.userId },
    });
  }

  async delete(body: IUserOrganization) {
    const existingCount = await this.userOrganizationRepository.count({
      where: {
        businessId: body.businessId,
      },
    });

    if (existingCount === 1) {
      throw new BadRequestException('Cannot delete only User in Organization');
    }
    await this.userOrganizationRepository.delete({
      businessId: body.businessId,
      userId: body.userId,
    });
  }
}
