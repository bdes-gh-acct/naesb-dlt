import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Request as NestRequest,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Request } from 'express';
import { AuthUser } from '../decorators/user.decorator';
import {
  Auth0UpdateUserReqDto,
  Auth0UserReqDto,
  Auth0BrandingReq,
} from './dtos/auth0.dto';
import { IdentityService } from './identity.service';
import { RolesGuard } from '../role.guard';
import { Roles } from '../decorators/role.decorator';

@ApiTags('Identity')
@Controller('identity')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Get('organizations/:org_id')
  get(@Param() { org_id }: any, @NestRequest() request: Request): Promise<any> {
    const userOrg = (request as any).user.org_id;
    console.log('Getting orgID.');
    if (userOrg !== org_id) {
      throw new UnauthorizedException();
    }
    return this.identityService.getOrganization(userOrg as string);
  }

  @Get('organizations')
  list(): Promise<any> {
    return this.identityService.getAllOrganizations();
  }

  @Get('organizations/:org_id/members')
  listUsers(
    @Param() { org_id }: any,
    @NestRequest() request: Request,
  ): Promise<any> {
    const userOrg = (request as any).user.org_id;
    if (userOrg !== org_id) {
      throw new UnauthorizedException();
    }
    return this.identityService.lookupUsers(userOrg as string);
  }

  @Roles(['admin'])
  @UseGuards(RolesGuard)
  @Patch('organizations/branding/:org_id')
  updateOrgBranding(
    @Param() { org_id }: { org_id: string },
    @Body() payload: Auth0BrandingReq,
  ): Promise<any> {
    return this.identityService.updateBranding(org_id, payload);
  }

  @Get('users/:userId')
  getUserById(@Param('userId') userId: string): Promise<any> {
    return this.identityService.getUserById(userId);
  }

  // update user
  @Patch('users/:userId')
  @UseGuards(RolesGuard)
  @Roles(['admin'])
  updateUserInfo(
    @AuthUser() requestingUser: Auth0UserReqDto,
    @Param('userId') userId: string,
    @Body() payload: Auth0UpdateUserReqDto,
  ): Promise<any> {
    return this.identityService.updateUserInfo(userId, payload);
  }

  // delete user
  @Delete('users/:userId')
  @Roles(['admin'])
  @UseGuards(RolesGuard)
  deleteUser(@Param('userId') userId: string): Promise<any> {
    return this.identityService.deleteUser(userId);
  }
}
