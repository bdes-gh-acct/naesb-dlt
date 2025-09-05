import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ConnectionService } from './connection.service';
import { EventPattern } from '@nestjs/microservices';
import axios from 'axios';

const { KAFKA_CLIENT_NAME } = process.env;

@Controller('Connections')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Get('/')
  public async getConnections() {
    return this.connectionService.getConnections({});
  }

  @Get('/:connectionId')
  public async getConnection(@Param('connectionId') connectionId: string) {
    return this.connectionService.getConnection(connectionId);
  }

  @Get('/:connectionId/metadata')
  public async getConnectionMetadata(
    @Param('connectionId') connectionId: string,
  ) {
    return this.connectionService.getMetadata(connectionId);
  }

  @Post('/Invite')
  public async createPublicInvitation(
    @Body() { did, their_alias }: { did: string; their_alias?: string },
  ) {
    return this.connectionService.receiveInvitation({ did, their_alias });
  }

  @EventPattern(`${KAFKA_CLIENT_NAME}.Webhook.connections`)
  async handleConnectionEvent({
    payload,
  }: {
    topic: string;
    payload: {
      created_at: string;
      updated_at: string;
      connection_id: string;
      connection_protocol: string;
      my_did: string;
      their_role: string;
      invitation_mode: string;
      their_public_did: string;
      routing_state: string;
      state: string;
      rfc23_state: string;
      their_did: string;
      request_id: string;
      accept: string;
    };
  }) {
    console.log(
      `Update for connection: ${payload.connection_id} state: ${payload.state}`,
    );
    if (payload.state === 'completed' && payload.their_public_did) {
      try {
        const didDoc = await this.connectionService.getDidDocument(
          `did:sov:${payload.their_public_did}`,
        );
        const serviceEndpoint = didDoc.did_document?.service?.find(
          (item) => item.type === 'Profile',
        )?.serviceEndpoint;
        if (serviceEndpoint) {
          const profile = (
            await axios.get(
              `${serviceEndpoint}/api/core/v1/.well-known/nodeinfo`,
            )
          ).data;
          console.log(profile);
          await this.connectionService.setMetadata(
            payload.connection_id,
            profile,
          );
        }
      } catch (err) {
        console.log(err);
      }
    }
  }
}
