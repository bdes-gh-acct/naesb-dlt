import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AgentService,
  CredentialDefinition,
  validate,
} from '@shared/agent-utils';
import { ICredentialDefinition } from '@naesb/aries-types';
import { Repository } from 'typeorm';
import { z } from 'zod';

const credentialSchema = (credentialDefinition?: ICredentialDefinition) =>
  z.object({
    credentialDefinitionId: z.string().refine(
      async (value) => {
        return Boolean(credentialDefinition);
      },
      { message: 'Credential definition does not exist' },
    ),
    comment: z.string().optional(),
    payload: z.record(z.string()),
    connectionId: z.string(),
  });

export interface IGetCreatedSchemasRequest {
  schema_id?: string;
  schema_issuer_did?: string;
  schema_name?: string;
  schema_version?: string;
}

@Injectable()
export class CredentialService {
  constructor(
    private readonly agentService: AgentService,
    @InjectRepository(CredentialDefinition)
    private readonly credentialDefinitionRepository: Repository<CredentialDefinition>,
  ) {}

  async getCredentialExchangeRecords() {
    const records = await this.agentService.getCredentialExchangeRecords();
    return {
      data: records?.results || [],
      totalRecords: records?.results.length || 0,
    };
  }

  async getCredentials() {
    const records = await this.agentService.getCredentials();
    return {
      data: records?.results || [],
      totalRecords: records?.results.length || 0,
    };
  }

  async issue({
    credentialDefinitionId,
    connectionId,
    comment,
    payload,
  }: {
    credentialDefinitionId: string;
    connectionId: string;
    comment?: string;
    payload: any;
  }) {
    const did = await this.agentService.getPublicDid();
    const credentialDefinition =
      await this.credentialDefinitionRepository.findOne({
        where: { id: credentialDefinitionId },
        relations: { schema: true },
      });
    const body = await validate(
      credentialSchema(credentialDefinition || undefined),
      { credentialDefinitionId, comment, payload, connectionId } as any,
    );
    if (credentialDefinition) {
      const request = {
        connection_id: connectionId,
        comment,
        credential_preview: {
          '@type': 'issue-credential/2.0/credential-preview',
          attributes: Object.entries(payload).map(([key, value]) => ({
            name: key,
            value,
          })),
        },
        filter: {
          indy: {
            schema_version: credentialDefinition.schema?.version,
            schema_id: credentialDefinition.schema?.id,
            schema_issuer_did: credentialDefinition.schema?.createdBy,
            cred_def_id: credentialDefinitionId,
            issuer_did: did?.result.did,
            schema_name: credentialDefinition.schema?.name,
          },
        },
        trace: true,
        auto_remove: false,
      };
      console.log(request);
      // @ts-ignore
      return this.agentService.issueCredential(request);
    }
    throw new Error();
  }
}
