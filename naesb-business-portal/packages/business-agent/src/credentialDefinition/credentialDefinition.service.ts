import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AgentService,
  CredentialDefinition,
  Schema,
  validate,
} from '@shared/agent-utils';
import { CreateCredentialDefinitionRequest } from '@naesb/aries-types';
import { Repository } from 'typeorm';
import { z } from 'zod';

const baseSchema = (repository: Repository<Schema>) =>
  z.object({
    schema_id: z.string().refine(
      async (value) => {
        return Boolean(repository.findOne({ where: { id: value } }));
      },
      { message: 'Schema could not be found' },
    ),
    tag: z.string().default('1'),
  });

const revocableSchema = (repository: Repository<Schema>) =>
  z
    .object({
      support_revocation: z.literal(true),
      revocation_registry_size: z.number().default(1000),
    })
    .merge(baseSchema(repository));

const nonRevocableSchema = (repository: Repository<Schema>) =>
  z
    .object({
      support_revocation: z.literal(false),
    })
    .merge(baseSchema(repository));

const credentialDefinitionSchema = (repository: Repository<Schema>) =>
  z.discriminatedUnion('support_revocation', [
    revocableSchema(repository),
    nonRevocableSchema(repository),
  ]);

export interface IGetCreatedSchemasRequest {
  schema_id?: string;
  schema_issuer_did?: string;
  schema_name?: string;
  schema_version?: string;
}

@Injectable()
export class CredentialDefinitionService {
  constructor(
    private readonly agentService: AgentService,
    @InjectRepository(Schema)
    private readonly schemaRepository: Repository<Schema>,
    @InjectRepository(CredentialDefinition)
    private readonly credentialDefinitionRepository: Repository<CredentialDefinition>,
  ) {}

  async getCreatedCredentialDefinitions() {
    const did = await this.agentService.getPublicDid();
    const [data, totalRecords] =
      await this.credentialDefinitionRepository.findAndCount({
        where: { createdBy: did?.result.did },
        relations: { did: true, schema: true },
      });
    return { data, totalRecords };
  }

  async create(options: CreateCredentialDefinitionRequest) {
    const body = await validate(
      credentialDefinitionSchema(this.schemaRepository),
      options as any,
    );
    return this.agentService.createCredentialDefinition(body);
  }
}
