import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../../generated/prisma/client';

/**
 * Extracts the User object set by AuthGuard from the request.
 * Use in controller method parameters:
 *
 *   @Get()
 *   getProjects(@CurrentUser() user: User) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): User => {
    const request = ctx.switchToHttp().getRequest();
    return request.currentUser;
  },
);