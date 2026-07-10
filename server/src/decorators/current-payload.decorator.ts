import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../generated/prisma/client';
import { PayloadType } from '../auth/payload-type';


export const CurrentPayload = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): PayloadType => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as PayloadType;
    return user;
  });