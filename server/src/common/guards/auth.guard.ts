import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../../prisma/prisma.service';

/**
 * Replaces Next.js getCurrentUser() / session cookies.
 *
 * Flow:
 *   1. Client calls POST /auth/login  → receives { userId: "uuid..." }
 *   2. Client passes userId in every subsequent request as:
 *        Header:  x-user-id: <uuid>
 *   3. This guard reads that header, fetches the User from the DB,
 *      and attaches it to request.currentUser.
 *   4. @CurrentUser() decorator reads request.currentUser in controllers.
 */
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

    // Attach the full User object — @CurrentUser() reads this
    (request as any).currentUser = user;
    return true;
  }
}