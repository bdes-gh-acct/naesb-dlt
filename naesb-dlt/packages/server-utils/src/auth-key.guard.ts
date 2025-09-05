import { HeaderAPIKeyStrategy } from 'passport-headerapikey';
import { AuthGuard, PassportStrategy } from '@nestjs/passport';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './auth.guard';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(HeaderAPIKeyStrategy) {
  constructor() {
    super(
      { header: 'apiKey', prefix: '' },
      true,
      (apiKey: string, done: any) => {
        if (apiKey !== process.env.API_KEY) {
          return done(false);
        }
        return done(true);
      },
    );
  }
}

@Injectable()
export class ApiKeyAuthGuard extends AuthGuard('api') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }
}
