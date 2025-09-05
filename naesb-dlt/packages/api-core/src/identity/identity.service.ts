/* eslint-disable no-await-in-loop */
/* eslint-disable no-param-reassign */
/* eslint-disable @typescript-eslint/lines-between-class-members */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { ManagementClient } from 'auth0';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cache } from 'cache-manager';
import { logger } from '../util/logger';

import {
  Auth0UpdateUserReqDto,
  Auth0BrandingReq,
  Auth0OrgReqDto,
} from './dtos/auth0.dto';

@Injectable()
export class IdentityService {
  constructor(
    private configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.managementClient = new ManagementClient({
      clientId: this.configService.get<string>('IDENTITY_CLIENT_ID'),
      clientSecret: this.configService.get<string>('IDENTITY_SECRET_ID'),
      domain: this.configService.get<string>('IDENTITY_DOMAIN'),
    });
  }
  private managementClient: ManagementClient;

  async getOrganization(
    id: string,
    useCache = false,
  ): Promise<{ id: string; name: string; display_name: string }> {
    if (useCache) {
      const org = await this.cacheManager.get<{
        id: string;
        name: string;
        display_name: string;
      }>(`ORGANIZATIONS::ID::${id}`);
      // @ts-ignore
      if (org && org !== {}) {
        console.log(`found org ${id} in cache`, JSON.stringify(org));
        return org;
      }
    }
    logger.info(id);
    try {
      // @ts-ignore
      const org = await this.managementClient.organizations.getByID({ id });
      if (org) {
        await this.cacheManager.set(`ORGANIZATIONS::ID::${id}`, org);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return org;
      }
      throw new NotFoundException();
    } catch (e) {
      logger.info(e);
      throw new NotFoundException();
    }
  }

  getAllOrganizations(): Promise<Auth0OrgReqDto[]> {
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.managementClient.organizations.getAll();
  }

  async updateBranding(id: string, branding: Auth0BrandingReq): Promise<any> {
    /* have to get current settings first, update api from Auth0 replaces whole
     branding object instead of just colors */
    // @ts-ignore
    const currentBranding = await this.managementClient.organizations.getByID({
      id,
    });
    branding.branding.logo_url = currentBranding.branding.logo_url;
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.managementClient.organizations.update({ id }, branding);
  }

  async lookupUsers(id: string): Promise<any> {
    let { members, next } =
      // @ts-ignore
      await this.managementClient.organizations.getMembers({
        id,
        include_totals: true,
      });
    if (!next) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return members;
    }
    while (next) {
      const { members: newMembers, next: newNext } =
        // @ts-ignore
        await this.managementClient.organizations.getMembers({
          id,
          include_totals: true,
        });
      members = [...members, ...newMembers];
      next = newNext;
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return members;
  }

  async getUserById(id: string): Promise<any> {
    return this.managementClient.getUser({ id });
  }

  async updateUserInfo(
    id: string,
    payload: Auth0UpdateUserReqDto,
  ): Promise<any> {
    // TODO: needs an auth guard to check if the user is self or admin
    return this.managementClient.updateUser({ id }, payload);
  }

  async deleteUser(id: string): Promise<any> {
    // TODO: needs an Auth Guard to check if user is ADMIN
    return this.managementClient.deleteUser({ id });
  }
}
