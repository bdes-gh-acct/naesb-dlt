import { Controller, Get, Request as NestRequest } from '@nestjs/common';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express';
import { IdentityService } from './identity.service';

@Controller('identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Get('organizations/find')
  getOrganization(@NestRequest() request: Request): Promise<any> {
    return this.identityService.getOrganization((request as any).user.org_id);
  }
}
