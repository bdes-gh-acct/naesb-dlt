/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<string[]>('roles', context.getHandler());
    const request = context.switchToHttp().getRequest();
    const { user } = request;
    const userToBeModifiedId = request.params.userId;

    if (request.route.methods.patch) {
      return matchRoles(roles, user[`${process.env.AUTH0_ROLE_NAMESPACE}`])
        ? true
        : matchUsers(user.sub, userToBeModifiedId);
    }

    return matchRoles(roles, user[`${process.env.AUTH0_ROLE_NAMESPACE}`]);
  }
}

const matchRoles = (roles: string[], userRoles: string[]): boolean => {
  let anyRolesMatch = false;

  if (roles && userRoles) {
    roles.forEach((role) => {
      if (!anyRolesMatch) {
        anyRolesMatch = userRoles.includes(role);
      }
    });
  }
  return anyRolesMatch;
};

const matchUsers = (
  requestingUser: string,
  userToBeModified: string,
): boolean => requestingUser === userToBeModified;
