import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const AuthUser = createParamDecorator((data, req: ExecutionContext) => {
  const request = req.switchToHttp().getRequest();
  const { user } = request;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return user;
});
