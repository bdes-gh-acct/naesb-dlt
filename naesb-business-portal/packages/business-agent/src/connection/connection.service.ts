import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  AgentService,
  CreateImplicitInvitationRequest,
  Did,
  GetConnectionRequest,
} from '@shared/agent-utils';
import { Repository } from 'typeorm';

export interface IGetCreatedSchemasRequest {
  schema_id?: string;
  schema_issuer_did?: string;
  schema_name?: string;
  schema_version?: string;
}

@Injectable()
export class ConnectionService {
  constructor(
    private readonly agentService: AgentService,
    @InjectRepository(Did) private readonly didRepository: Repository<Did>,
  ) {}

  async receiveInvitation(options: CreateImplicitInvitationRequest) {
    return this.agentService.implicitInvitation(options);
  }

  async getDidDocument(did: string) {
    return this.agentService.resolveDidInfo(did);
  }

  async setMetadata(connectionId: string, data: any) {
    return this.agentService.setConnectionMetadata({
      connection_id: connectionId,
      metadata: data,
    });
  }

  async getMetadata(connectionId: string) {
    const { results } = await this.agentService.getConnectionMetadata(
      connectionId,
    );
    return results;
  }

  async getConnection(connectionId: string) {
    const result = await this.agentService.getConnection(connectionId);
    if (result) {
      const metadata = await this.getMetadata(connectionId);
      return { result, ...metadata };
    }
    return result;
  }

  async getConnections(options: GetConnectionRequest) {
    const [connections, dids] = await Promise.all([
      this.agentService.getConnections(options),
      this.didRepository.find(),
    ]);
    // @ts-ignore
    const data = connections?.results?.map((connection) => {
      return {
        ...connection,
        _did: dids.find(
          (did) =>
            did.id === connection.their_public_did ||
            did.id === connection.their_did,
        ),
      };
    });
    return {
      data: data || [],
      totalRecords: data?.length,
    };
  }
}
