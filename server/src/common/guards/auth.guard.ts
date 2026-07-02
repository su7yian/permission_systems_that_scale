import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const userId = request.headers['x-user-id'] as string | undefined;

    if (!userId) {
      throw new UnauthorizedException(
        'Missing x-user-id header. Call POST /auth/login first to get your userId.',
      );
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new UnauthorizedException(
        `No user found with id "${userId}". Re-run the seed or check the userId.`,
      );
    }

    // Attach the full User to express's request object — @CurrentUser() will ask express for request.user, and return it to the controller method.
    (request as any).user = user;
    return true;
  }
}