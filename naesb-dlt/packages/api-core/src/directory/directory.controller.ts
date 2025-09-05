import { Controller, Get, Param, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express';
import { DirectoryService } from './directory.service';
import { AriesService } from '../aries/aries.service';
import { LedgerService } from '../ledger/ledger.service';
// eslint-disable-next-line import/no-extraneous-dependencies

@ApiTags('Directory')
@Controller('Directory')
export class DirectoryController {
  constructor(
    private directoryService: DirectoryService,
    private ledgerService: LedgerService,
    private ariesService: AriesService,
  ) {}

  @Get('')
  async list(@Req() { headers: { authorization } }: Request) {
    console.log('Getting directory');
    const [organizations, channels, connections] = await Promise.all([
      this.directoryService.getOrganizations(authorization),
      this.ledgerService.getChannels(authorization),
      this.ariesService.getConnections(authorization),
    ]);
    const result = organizations.data?.map((org) => ({
      ...org,
      channel: channels?.data.find(
        (channel) => channel.CounterpartyId === org.businessId,
      ),
      connection: org.did
        ? connections.data.find(
            (connection) =>
              connection.their_did === org.did ||
              connection.their_public_did === org.did,
          )
        : undefined,
    }));
    return { data: result, totalRecords: organizations.totalRecords };
  }

  @Get(':businessId')
  async get(
    @Req() { headers: { authorization } }: Request,
    @Param('businessId') businessId: string,
  ) {
    console.log('Getting business ID');
    const [organization, channels, connections] = await Promise.all([
      this.directoryService.getOrganization(authorization, businessId),
      this.ledgerService.getChannels(authorization),
      this.ariesService.getConnections(authorization),
    ]);
    console.log('Got business ID.');
    const result = {
      ...organization,
      channel: channels?.data.find(
        (channel) => channel.CounterpartyId === organization.businessId,
      ),
      connection: organization.did
        ? connections.data.find(
            (connection) =>
              connection.their_did === organization.did ||
              connection.their_public_did === organization.did,
          )
        : undefined,
    };
    return result;
  }
}
