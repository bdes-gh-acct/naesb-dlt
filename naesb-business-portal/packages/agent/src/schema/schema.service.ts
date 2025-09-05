import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { maxBy } from 'lodash';
import {
  AgentService,
  AiresCredentialDefinition,
  AriesSchema,
} from '@shared/agent-utils';

const {
  AGENT_URL,
  AGENT_ADMIN_API_KEY,
  NAESB_DID,
  CREATE_SCHEMA = true,
  CREATED_CREDENTIAL_DEFINITION,
} = process.env;

export interface IGetCreatedSchemasRequest {
  schema_id?: string;
  schema_issuer_did?: string;
  schema_name?: string;
  schema_version?: string;
}

@Injectable()
export class SchemaService {
  constructor(private readonly agentService: AgentService) {
    this.init();
  }

  private schema?: AriesSchema;
  private credentialDefintion?: AiresCredentialDefinition;

  async init() {
    console.log('Fetching existing schemas');
    const { schema_ids } = await this.agentService.getCreatedSchemas({
      schema_name: 'NAESB_GAS_CERTIFICATE',
      ...(NAESB_DID && { schema_issuer_did: NAESB_DID }),
    });
    if (schema_ids.length) {
      console.log(`found ${schema_ids.length} existing schemas`);
      const schema_id = maxBy(schema_ids, (id: string) => id.split(':')[1]);
      this.schema = (
        await this.agentService.getSchema(schema_id as string)
      ).schema;
    } else if (CREATE_SCHEMA) {
      console.log('Creating NAESB schema');
      const result = await this.agentService.createSchema({
        schema_name: 'NAESB_GAS_CERTIFICATE',
        schema_version: '1.0',
        attributes: [
          'certificate_id',
          'effective',
          'expiration',
          'rating',
          'score',
          'target_id',
          'issued_to',
          'target_name',
          'target_type',
        ],
      });
      this.schema = result.sent.schema;
    }
    console.log('NAESB schema initiated');
    if (this.schema) {
      console.log('Fetching existing credential definitions');
      const { credential_definition_ids } =
        await this.agentService.getCreatedCredentialDefinitions({
          schema_id: this.schema.id,
        });
      if (credential_definition_ids.length) {
        console.log(
          `found ${credential_definition_ids.length} existing credential definitions`,
        );
        const credentialDefinitionId = credential_definition_ids[0];
        this.credentialDefintion = (
          await this.agentService.getCredentialDefinition(
            credentialDefinitionId as string,
          )
        ).credential_definition;
      } else if (CREATED_CREDENTIAL_DEFINITION) {
        console.log('Creating NAESB Credential Definition');
        const result = await this.agentService.createCredentialDefinition({
          schema_id: this.schema.id,
          support_revocation: true,
          revocation_registry_size: 1000,
          tag: 'default',
        });

        this.credentialDefintion = (
          await this.agentService.getCredentialDefinition(
            result.sent.credential_definition_id,
          )
        ).credential_definition;
        console.log(
          `Created NAESB Credential Defintion: ${this.credentialDefintion.id}`,
        );
      }
    }
  }

  getNaesbSchema() {
    return this.schema;
  }

  async post<TData, TResponse = any>({
    url,
    body,
    config,
  }: {
    url: string;
    body?: TData;
    config?: AxiosRequestConfig<TData>;
  }) {
    const result = await axios.post<TData, AxiosResponse<TResponse>>(
      `${AGENT_URL}${url}`,
      body,
      {
        ...config,
        headers: { 'X-API-Key': AGENT_ADMIN_API_KEY },
      },
    );
    return result.data;
  }

  async get<TData, TResponse = any>({
    url,
    config,
  }: {
    url: string;
    config?: AxiosRequestConfig<TData>;
  }) {
    const result = await axios.get<AxiosResponse<TResponse>>(
      `${AGENT_URL}${url}`,
      {
        ...config,
        headers: { 'X-API-Key': AGENT_ADMIN_API_KEY },
      },
    );
    return result.data;
  }

  async getCreatedSchemasSchema(options: IGetCreatedSchemasRequest) {
    return this.get({ url: '/schemas/created', config: { params: options } });
  }

  async getSchema(id: string) {
    return this.get({ url: `/schemas/${id}` });
  }
}
