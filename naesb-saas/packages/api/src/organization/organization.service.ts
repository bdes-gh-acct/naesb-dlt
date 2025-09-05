import { Injectable, Request } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions, Repository } from 'typeorm';
import {
  IOrganization,
  QueryResult,
  TaxNumberType,
  CompanyType,
  BusinessStatus,
} from '@shared/model';
import { z } from 'zod';
import { UserOrganizationService } from 'src/userOrganization/userOrganization.service';
import { Organization } from '../db';
import { validate } from '../util/validate';

const createOrganizationSchema = (
  organizationRepository: Repository<Organization>,
) =>
  z.object({
    name: z.string(),
    address: z.string(),
    website: z.string().url(),
    taxNumber: z.coerce.string(),
    taxNumberType: z.nativeEnum(TaxNumberType),
    jurisdiction: z.string().optional(),
    companyType: z.nativeEnum(CompanyType),
    otherCompanyType: z.string().optional(),
    businessId: z.string().refine(
      async (value) => {
        const business = await organizationRepository.findOne({
          where: { businessId: value },
        });
        return !business;
      },
      { message: 'Organization with this Business Id already exists' },
    ),
  });

const editOrganizationSchema = (
  organizationRepository: Repository<Organization>,
) =>
  z.object({
    name: z.string(),
    address: z.string(),
    website: z.string().url(),
    taxNumber: z.coerce.string(),
    taxNumberType: z.nativeEnum(TaxNumberType),
    jurisdiction: z.string().optional(),
    companyType: z.nativeEnum(CompanyType),
    otherCompanyType: z.string().optional().nullable(),
    businessId: z.string().refine(
      async (value) => {
        const business = await organizationRepository.findOne({
          where: { businessId: value },
        });
        return Boolean(business);
      },
      { message: 'Organization with this Business Id does not exist' },
    ),
  });

const editOrganizationDidSchema = (
  organizationRepository: Repository<Organization>,
) =>
  z.object({
    did: z.string(),
    verKey: z.string(),
    businessId: z.string().refine(
      async (value) => {
        const business = await organizationRepository.findOne({
          where: { businessId: value },
        });
        return Boolean(business);
      },
      { message: 'Organization with this Business Id does not exist' },
    ),
  });

@Injectable()
export class OrganizationService {
  constructor(
    private readonly userOrganizationService: UserOrganizationService,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
  ) {}

  async findMany(
    options?: FindManyOptions<Organization>,
  ): Promise<QueryResult<IOrganization>> {
    const [data, totalRecords] = await this.organizationRepository.findAndCount(
      {
        ...(options || {}),
        relations: { roles: { role: true } },
      },
    );
    return { data, totalRecords, timestamp: new Date().toISOString() };
  }

  findOne(id: string): Promise<IOrganization | null> {
    return this.organizationRepository.findOne({
      where: { businessId: id },
      relations: { roles: { role: true } },
    });
  }

  async create(body: IOrganization, request: Request) {
    const organization = await validate(
      createOrganizationSchema(this.organizationRepository),
      body as any,
    );
    await this.organizationRepository.insert({
      ...organization,
      businessStatus: BusinessStatus.SUBMITTED,
    });
    await this.userOrganizationService.create({
      businessId: body.businessId,
      userId: request.user?.sub as string,
    });
    return this.organizationRepository.findOne({
      where: { businessId: organization.businessId },
    });
  }

  async edit(body: IOrganization) {
    const organization = await validate(
      editOrganizationSchema(this.organizationRepository),
      body as any,
    );
    await this.organizationRepository.update(
      organization.businessId,
      organization,
    );
    return this.organizationRepository.findOne({
      where: { businessId: organization.businessId },
    });
  }

  async editDid(body: IOrganization) {
    const organization = await validate(
      editOrganizationDidSchema(this.organizationRepository),
      body as any,
    );
    await this.organizationRepository.update(
      organization.businessId,
      organization,
    );
    return this.organizationRepository.findOne({
      where: { businessId: organization.businessId },
    });
  }
}
