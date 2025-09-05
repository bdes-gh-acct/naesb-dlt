/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ManagementClient } from 'auth0';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class IdentityService {
  private managementClient: ManagementClient;

  private organizationClient: any;

  constructor(private configService: ConfigService) {
    this.managementClient = new ManagementClient({
      clientId: this.configService.get<string>('IDENTITY_CLIENT_ID'),
      clientSecret: this.configService.get<string>('IDENTITY_SECRET_ID'),
      domain: this.configService.get<string>('IDENTITY_DOMAIN') as string,
    });
  }

  getOrganization(
    id: string,
  ): Promise<{ id: string; name: string; display_name: string }> {
    // @ts-ignore
    return this.managementClient.organizations.getByID({ id });
  }
}
