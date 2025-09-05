import { Injectable } from '@nestjs/common';
import axios, { AxiosRequestConfig, AxiosResponse } from 'axios';
import { AgentService, validate } from '@shared/agent-utils';
import { z } from 'zod';

const { AGENT_URL, AGENT_ADMIN_API_KEY } = process.env;

const createSchemaSchema = z.object({
  attributes: z.array(z.string()),
  schema_name: z.string(),
  schema_version: z.string(),
});

export interface IGetCreatedSchemasRequest {
  schema_id?: string;
  schema_issuer_did?: string;
  schema_name?: string;
  schema_version?: string;
}

export interface ICreateSchemaRequest {
  schema_name: string;
  schema_version: string;
  attributes: Array<string>;
}

@Injectable()
export class SchemaService {
  constructor(private readonly agentService: AgentService) {}

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

  async create(request: ICreateSchemaRequest) {
    const body = await validate(createSchemaSchema, request as any);
    return this.agentService.createSchema(body);
  }
}
