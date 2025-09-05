import { Injectable } from '@nestjs/common';
import {
  AriesCredential,
  AriesCredentialExchangeRecord,
  CreateCredentialDefinitionRequest,
  CredentialExchangeRecord,
  PresentProofRecord,
} from '@naesb/aries-types';
import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as dotenv from 'dotenv';

dotenv.config();
const { AGENT_URL, AGENT_ADMIN_API_KEY } = process.env;

export interface GetCreatedSchemasRequest {
  schema_id?: string;
  schema_issuer_did?: string;
  schema_name?: string;
  schema_version?: string;
}

export interface SetConnectionMetadataRequest {
  connection_id: string;
  metadata: any;
}

export interface CreateSchemaRequest {
  schema_name: string;
  schema_version: string;
  attributes: Array<string>;
}

export interface GetPublicDidResponse {
  result: {
    did: string;
    key_type: string;
    method: string;
    posture: string;
    verkey: string;
  };
}

export interface AriesConnection {
  accept: string;
  alias: string;
  connection_id: string;
  connection_protocol: string;
  created_at: string;
  error_msg?: string;
  inbound_connection_id: string;
  invitation_key: string;
  invitation_mode: string;
  invitation_msg_id: string;
  my_did: string;
  request_id: string;
  rfc23_state: string;
  routing_state: string;
  state: string;
  their_did: string;
  their_label: string;
  their_public_did: string;
  their_role: string;
  updated_at: string;
}

export interface PublicInvitation {
  '@type'?: string;
  '@id'?: string;
  imageUrl?: string;
  did?: string;
  label?: string;
}

export interface ReceiveConnectionInvitationRequest {
  invitation: PublicInvitation;
  auto_accept?: boolean;
  alias?: string;
}

export interface GetConnectionsResponse {
  data: Array<AriesConnection>;
  totalRecords: number;
}

export interface GetConnectionRequest {
  alias?: string;
  connection_protocol?: string;
  invitation_key?: string;
  invitation_msg_id?: string;
  my_did?: string;
  state?: string;
  their_did?: string;
  their_public_did?: string;
  their_role?: string;
}

export interface IssueCredentialRequest<TSchema extends object> {
  comment?: string;
  connection_id: string;
  credential_preview: {
    '@type': 'issue-credential/2.0/credential-preview';
    attributes: Array<{ name: keyof TSchema; value: string }>;
  };
  filter: {
    indy: {
      schema_version: string;
      schema_id: string;
      schema_issuer_did: string;
      cred_def_id: string;
      issuer_did: string;
      schema_name: string;
    };
  };
  trace: true;
  auto_remove: true;
}

export interface GetCreatedCredentialDefinitionsRequest {
  cred_def_id?: string;
  issuer_did?: string;
  schema_id?: string;
  schema_issuer_did?: string;
  schema_name?: string;
  schema_version?: string;
}

export interface CreateSchemaResponse {
  sent: {
    schema: AriesSchema;
    schema_id: string;
  };
  txn: {
    _type: string;
    connection_id: string;
    created_at: string;
    endorser_write_txn: boolean;
    formats: Array<any>;
    messages_attach: Array<any>;
    meta_data: {
      context: any;
      post_process: Array<any>;
    };
    signature_request: Array<any>;
    signature_response: Array<any>;
    state: string;
    thread_id: string;
    timing: {
      expires_time: string;
    };
    trace: true;
    transaction_id: string;
    updated_at: string;
  };
}

export enum IndyRole {
  STEWARD = 'STEWARD',
  TRUSTEE = 'TRUSTEE',
  ENDORSER = 'ENDORSER',
  NETWORK_MONITOR = 'NETWORK_MONITOR',
}

export interface RegisterNymRequest {
  did: string;
  verkey: string;
  alias: string;
  role: IndyRole;
}

export interface RegisterNymResponse {
  success: boolean;
}

export interface CreateCredentialDefinitionResponse {
  sent: {
    credential_definition_id: string;
  };
  txn: {
    _type: string;
    connection_id: string;
    created_at: string;
    endorser_write_txn: boolean;
    formats: Array<any>;
    messages_attach: Array<any>;
    meta_data: {
      context: any;
      post_process: Array<any>;
    };
    signature_request: Array<any>;
    signature_response: Array<any>;
    state: string;
    thread_id: string;
    timing: {
      expires_time: string;
    };
    trace: true;
    transaction_id: string;
    updated_at: string;
  };
}

export interface AriesSchema {
  attrNames: Array<string>;
  id: string;
  name: string;
  seqNo: number;
  ver: string;
  version: string;
}

export interface GetSchemaResponse {
  schema: AriesSchema;
}

export interface AiresCredentialDefinition {
  id: string;
  schemaId: string;
  tag: string;
  type: string;
  value: {
    primary: any;
    revocation: any;
  };
  ver: '1.0';
}

export interface CreateInvitationRequest {
  alias?: string;
  public?: boolean;
  auto_accept?: boolean;
  multi_use?: boolean;
}

export interface CreateInvitationResponse {
  connection_id: never;
  invitation: {
    '@type': string;
    '@id': string;
    imageUrl?: string;
    did: string;
    label: string;
    recipientKeys: Array<string>;
  };
  invitation_url: string;
}

export interface CreateImplicitInvitationRequest {
  did: string;
  use_public_did?: boolean;
  their_alias?: string;
}

export interface GetCredentialDefinitionResponse {
  credential_definition: AiresCredentialDefinition;
}

@Injectable()
export class AgentService {
  async post<TData, TResponse = any>({
    url,
    body,
    config,
  }: {
    url: string;
    body?: TData;
    config?: AxiosRequestConfig<TData>;
  }) {
    try {
      const result = await axios.post<TData, AxiosResponse<TResponse>>(
        `${AGENT_URL}${url}`,
        body,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        {
          ...config,
          headers: { 'X-API-Key': AGENT_ADMIN_API_KEY },
        },
      );
      return result.data;
    } catch (e) {
      const error = e as AxiosError;
      console.log(error.response?.status, error.response?.data);
      throw e;
    }
  }

  async get<TResponse = any>({
    url,
    config,
  }: {
    url: string;
    config?: AxiosRequestConfig;
  }) {
    try {
      const result = await axios.get<TResponse>(`${AGENT_URL}${url}`, {
        ...config,
        headers: { 'X-API-Key': AGENT_ADMIN_API_KEY },
      });
      return result.data;
    } catch (e) {
      const error = e as AxiosError;
      console.log(error.response?.status, error.response?.data);
      throw e;
    }
  }

  async getCreatedSchemas(options: GetCreatedSchemasRequest) {
    return this.get<{ schema_ids: Array<string> }>({
      url: '/schemas/created',
      config: { params: options },
    });
  }

  async setConnectionMetadata({
    connection_id,
    metadata,
  }: SetConnectionMetadataRequest) {
    return this.post<any, any>({
      url: `/connections/${connection_id}/metadata`,
      body: { metadata },
    });
  }

  async getConnectionMetadata(connectionId: string) {
    return this.get<any>({
      url: `/connections/${connectionId}/metadata`,
    });
  }

  async resolveDidInfo(did: string) {
    return this.get<{
      did_document: {
        service: Array<{ id: string; type: string; serviceEndpoint: string }>;
      };
      metadata: any;
    }>({
      url: `/resolver/resolve/${did}`,
    });
  }

  async getCreatedCredentialDefinitions(
    options: GetCreatedCredentialDefinitionsRequest,
  ) {
    return this.get<{ credential_definition_ids: Array<string> }>({
      url: '/credential-definitions/created',
      config: { params: options },
    });
  }

  async getCredentialExchangeRecords<TSchema extends object>() {
    return this.get<{
      results: Array<AriesCredentialExchangeRecord<TSchema>>;
    }>({
      url: '/issue-credential-2.0/records',
    });
  }

  async getConnections(options: GetConnectionRequest) {
    return this.get<GetConnectionsResponse>({
      url: '/connections',
      config: { params: options },
    });
  }

  async getConnection(connectionId: string) {
    return this.get<AriesConnection>({
      url: `/connections/${connectionId}`,
    });
  }

  async registerNym(options: RegisterNymRequest) {
    return this.post<never, RegisterNymResponse>({
      url: '/ledger/register-nym',
      config: { params: options },
    });
  }

  async receiveInvitation({
    invitation,
    ...options
  }: ReceiveConnectionInvitationRequest) {
    return this.post<PublicInvitation, AriesConnection>({
      url: '/connections/receive-invitation',
      config: { params: options },
      body: invitation,
    });
  }

  async implicitInvitation({
    use_public_did = true,
    did,
    their_alias,
  }: CreateImplicitInvitationRequest) {
    return this.post<never, AriesConnection>({
      url: '/didexchange/create-request',
      config: {
        params: { use_public_did, their_public_did: did, alias: their_alias },
      },
    });
  }

  async getPublicDid() {
    return this.get<GetPublicDidResponse>({
      url: '/wallet/did/public',
    });
  }

  async createInvitation(options: CreateInvitationRequest) {
    return this.post<never, CreateInvitationResponse>({
      url: '/connections/create-invitation',
      config: { params: options },
    });
  }

  async getSchema(id: string) {
    return this.get<GetSchemaResponse>({ url: `/schemas/${id}` });
  }

  async getCredentialDefinition(id: string) {
    return this.get<GetCredentialDefinitionResponse>({
      url: `/credential-definitions/${id}`,
    });
  }

  async createSchema(options: CreateSchemaRequest) {
    return this.post<CreateSchemaRequest, CreateSchemaResponse>({
      url: '/schemas',
      body: options,
    });
  }

  async issueCredential<TSchema extends object>(
    options: IssueCredentialRequest<TSchema>,
  ) {
    return this.post<
      IssueCredentialRequest<TSchema>,
      CredentialExchangeRecord<TSchema>
    >({
      url: '/issue-credential-2.0/send',
      body: options,
    });
  }

  async getCredentials() {
    return this.get<{ results: Array<AriesCredential> }>({
      url: '/credentials',
    });
  }

  async createCredentialDefinition(options: CreateCredentialDefinitionRequest) {
    return this.post<
      CreateCredentialDefinitionRequest,
      CreateCredentialDefinitionResponse
    >({
      url: '/credential-definitions',
      body: options,
    });
  }

  async verifyPresentation({
    presentationExchangeId,
  }: {
    presentationExchangeId: string;
  }) {
    return this.post<object, PresentProofRecord>({
      url: `/present-proof-2.0/records/${presentationExchangeId}`,
      body: {},
    });
  }
}
