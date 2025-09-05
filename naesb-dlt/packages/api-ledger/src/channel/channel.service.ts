import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService, logger, validate } from '@shared/server-utils';
import { Repository } from 'typeorm';
import { z } from 'zod';
import * as fs from 'fs';
import { customAlphabet } from 'nanoid';
import { ChannelInvitationResponse, ChannelStatus } from '@naesb/dlt-model';
import { ClientProxy } from '@nestjs/microservices';
import { Channel } from '../db/channel.entity';
import { env } from '../env';
import { PeerService } from '../peer/peer.service';
import { LedgerService } from '../ledger/ledger.service';

const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyz-', 12);

const { ORG_NAME, ORG_MSP_ID, PROFILE_ENDPOINT, ADMIN_ADDRESS } = env;

export interface CreateChannelParams {
  ChannelId: string;
  CounterpartyId: string;
  Name: string;
  CounterpartyEndpoint: string;
}

export interface ReplyChannelParams {
  ChannelId: string;
  CounterpartyEndpoint?: string;
  Response?: ChannelInvitationResponse;
}

export interface InviteChannelParams {
  ChannelId: string;
  CounterpartyId: string;
  Name: string;
  CounterpartyEndpoint: string;
}

export interface AckChannelParams {
  ChannelId: string;
  CounterpartyEndpoint: string;
  AnchorPeers: Array<{ Host: string; Port: number }>;
}

const createChannelSchema = (channelRepository: Repository<Channel>) =>
  z.object({
    ChannelId: z.string().refine(async (val) => {
      const existing = await channelRepository.findOne({
        where: { CounterpartyId: val },
      });
      return !existing;
    }, 'Channel already exists with this organization'),
    CounterpartyId: z.string(),
    Name: z.string(),
    CounterpartyEndpoint: z.string(),
  });

const inviteChannelSchema = (channelRepository: Repository<Channel>) =>
  z.object({
    ChannelId: z.string().refine(async (val) => {
      const existing = await channelRepository.findOne({
        where: { CounterpartyId: val },
      });
      return !existing;
    }),
    CounterpartyId: z.string(),
    Name: z.string(),
    CounterpartyEndpoint: z.string(),
  });

const replyChannelSchema = (channel?: Channel | null) =>
  z.object({
    ChannelId: z
      .string()
      .refine(
        () =>
          channel &&
          (channel.Status === ChannelStatus.INVITATION_RECEIVED ||
            channel.Status === ChannelStatus.APPROVED),
        `Channel does not exist or is not in ${ChannelStatus.INVITATION_RECEIVED} status`,
      ),
    CounterpartyEndpoint: z.string().optional(),
    Response: z.nativeEnum(ChannelInvitationResponse),
  });

const ackChannelSchema = (channel?: Channel | null) =>
  z.object({
    ChannelId: z
      .string()
      .refine(
        () =>
          channel &&
          (channel.Status === ChannelStatus.INVITATION_SENT ||
            channel.Status === ChannelStatus.APPROVED),
        `Channel does not exist or is not in ${ChannelStatus.INVITATION_SENT} status`,
      ),
    CounterpartyEndpoint: z.string().optional(),
    AnchorPeers: z.array(
      z.object({
        Host: z.string(),
        Port: z.number(),
      }),
    ),
  });

@Injectable()
export class ChannelService {
  constructor(
    @InjectRepository(Channel)
    private channelRepository: Repository<Channel>,
    private readonly httpService: HttpService,
    private readonly peerService: PeerService,
    private readonly ledgerService: LedgerService,
    @Inject(env.KAFKA_CLIENT_NAME) private client: ClientProxy,
  ) {}

  async getChannelInfo(channelId: string) {
    const [chainInfo, channel, discovery] = await Promise.all([
      this.ledgerService.queryChainInfo({ channel: channelId }),
      this.channelRepository.findOne({
        where: { ChannelId: channelId },
        relations: { Members: true },
      }),
      this.peerService.getChannelDetails(channelId),
    ]);
    return { chainInfo, channel, discovery };
  }

  async create(input: Omit<CreateChannelParams, 'ChannelId'>) {
    const id = `c-${nanoid()}`;
    console.log(
      `Starting channel creation.`,
    );
    const { ChannelId, Name, CounterpartyId, CounterpartyEndpoint } =
      await validate<CreateChannelParams>(
        createChannelSchema(this.channelRepository),
        { ...input, ChannelId: id },
      );
    console.log(
      `Finsihed Schema.`,
    );
    
    console.log(
      `Sending invitation.`,
    );

    console.log(`${CounterpartyEndpoint}/api/ledger/v1/channels/Invite`);
    // Send invitation to counterparty
    await this.httpService.post(
      `${CounterpartyEndpoint}/api/ledger/v1/channels/Invite`,
      {
        ChannelId,
        Name: ORG_NAME,
        CounterpartyId: ORG_MSP_ID,
        CounterpartyEndpoint: PROFILE_ENDPOINT,
      },
    );
    console.log('Invitation sent.');
    const result = await this.channelRepository.save({
      ChannelId,
      Name,
      CounterpartyId,
      CounterpartyEndpoint,
      Status: ChannelStatus.INVITATION_SENT,
    });
    console.log('Invitation now really sent.');
    return result;
  }

  async invite(params: InviteChannelParams) {
    const { ChannelId, Name, CounterpartyId, CounterpartyEndpoint } =
      await validate<CreateChannelParams>(
        inviteChannelSchema(this.channelRepository),
        params,
      );
    const result = await this.channelRepository.save({
      ChannelId,
      Name,
      Status: ChannelStatus.INVITATION_RECEIVED,
      CounterpartyId,
      CounterpartyEndpoint,
    });
    return result;
  }

  async reply(authorization: string, params: ReplyChannelParams) {
    console.log(
      `Replying to invitation.`,
    );
    const existing = await this.channelRepository.findOne({
      where: { ChannelId: params.ChannelId },
    });
    console.log('Looked if existing channel. Getting reply schema.');
    const { ChannelId, CounterpartyEndpoint, Response } =
      await validate<ReplyChannelParams>(replyChannelSchema(existing), params);
    console.log('Validated reply schema. Sendingh ACK post.');
    await this.httpService.post(
      `${
        CounterpartyEndpoint || existing?.CounterpartyEndpoint
      }/api/ledger/v1/channels/Ack`,
      {
        Response,
        ChannelId,
        AnchorPeers: [
          { Host: `peer0.peer-${ORG_NAME}.service.consul`, Port: 9051 },
        ],
      },
      { headers: { authorization } },
    );
    console.log('Ack post sent, updating repository.');
    const result = await this.channelRepository.update(ChannelId, {
      CounterpartyEndpoint:
        params.CounterpartyEndpoint || existing?.CounterpartyEndpoint,
      Status:
        Response === ChannelInvitationResponse.APPROVE
          ? ChannelStatus.APPROVED
          : ChannelStatus.REJECTED,
    });
    console.log('Updated repository.');
    return result;
  }

  async ack(token: string, params: AckChannelParams) {
    console.log(
      `Acknowledging invite.`,
    );
    const existing = await this.channelRepository.findOne({
      where: { ChannelId: params.ChannelId },
    });
    console.log('Found the channel ID.');
    const { ChannelId, AnchorPeers, CounterpartyEndpoint } = await validate(
      ackChannelSchema(existing),
      params,
    );
    console.log('Validated the schema for Ack.');
    const result = await this.channelRepository.update(ChannelId, {
      Status: ChannelStatus.APPROVED,
      CounterpartyEndpoint:
        CounterpartyEndpoint || existing?.CounterpartyEndpoint,
    });
    console.log('Updated channel repository.');
    const organizations = [
      {
        Name: ORG_MSP_ID,
        ID: ORG_MSP_ID,
        Endpoint: PROFILE_ENDPOINT,
        AnchorPeers: [
          { Host: `peer0.peer-${ORG_NAME}.service.consul`, Port: 9051 },
        ],
      },
      {
        Name: existing?.CounterpartyId,
        ID: existing?.CounterpartyId,
        Endpoint: CounterpartyEndpoint || existing?.CounterpartyEndpoint,
        AnchorPeers,
      },
    ];
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    console.log('Messaging admin.');
    console.log(`${ADMIN_ADDRESS}/api/admin/v1/Channels`);
    await this.httpService.post(
      `${ADMIN_ADDRESS}/api/admin/v1/Channels`,
      {
        ChannelId,
        organizations,
      },
      {
        headers: {
          authorization: token,
        },
      },
    );
    console.log('Messaged admin.');
    return result;
  }

  async join({
    channelId,
    configTx,
    additionalInfo,
  }: {
    channelId: string;
    configTx: string;
    additionalInfo: {
      parties: Array<{ name: string; msp: string }>;
    };
  }) {
    const BLOCK_DIR = `/tmp/channels/${channelId}`;
    console.log(
      `Joining channel.`,
    );
    if (!fs.existsSync(BLOCK_DIR)) {
      fs.mkdirSync(BLOCK_DIR, { recursive: true });
      fs.writeFileSync(
        `${BLOCK_DIR}/block.pb`,
        Buffer.from(configTx, 'base64'),
      );
    }
    const existingChannel = await this.channelRepository.findOne({
      where: { ChannelId: channelId },
    });
    if (ORG_NAME.toUpperCase() === 'NAESB') {
      if (!existingChannel) {
        await this.channelRepository.save({
          ChannelId: channelId,
          NetworkStatus: 'Joining',
          Name: additionalInfo.parties.map((party) => party.name).join('-'),
        });
      }
    } else if (!existingChannel) {
      throw new NotFoundException();
    }
    try {
      await this.peerService.joinPeer(channelId, `${BLOCK_DIR}/block.pb`);
      await this.channelRepository.update(channelId, {
        NetworkStatus: 'Joined',
      });
      this.client.emit(
        `${env.KAFKA_CLIENT_NAME}.ledger.event.channel`,
        JSON.stringify({
          channel_id: channelId,
        }),
      );

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
    } catch (e) {
      logger.error(`Error joining channel. ${e.message}`);
      await this.channelRepository.update(channelId, {
        NetworkStatus: 'Join Failed',
      });
    }
  }
}
