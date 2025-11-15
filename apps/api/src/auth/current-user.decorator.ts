import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUserPayload } from './types/auth-response';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthenticatedUserPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  }
);

