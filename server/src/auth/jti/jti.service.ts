import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';

@Injectable()
export class JtiService {
  constructor(
    private readonly redis: RedisService,
    private readonly prisma: PrismaService
  ) {}

  async addJTI(id: string, jti: string): Promise<void> {
    const key = `user:${id}:jtis`;
    await this.redis.client.sAdd(key, jti);
    await this.redis.client.expire(key, 604800); // 7 days
    // Store the JTI in the database as well
    await this.prisma.user.update({
      where: { id: id },
      data: {
        jtis: {
          push: jti,
        },
      },
    });
  }

  async isJTIValid(id: string, jti: string): Promise<boolean> {
    const key = `user:${id}:jtis`;
    const result = await this.redis.client.sIsMember(key, jti);
    if (result) {
      return true;
    } else {
      // Check in the database if not found in Redis
      const user = await this.prisma.user.findUnique({
        where: { id: id },
        select: { jtis: true },
      });
      if (user && user.jtis.includes(jti)) {
        return true;
      }
    }
    return false;
  }


  // Delete current JTI for a user to logout from current device
  async removeJTI(id: string, jti: string): Promise<void> {
    const key = `user:${id}:jtis`;
    await this.redis.client.sRem(key, jti);

    await this.prisma.$executeRaw`
      UPDATE "users" 
      SET "jtis" = array_remove("jtis", ${jti}) 
      WHERE "id" = ${id}; `;
  }

  // Delete ALL JTIs for a user to logout from all devices
  async deleteAllJTIs(id: string): Promise<void> {
    const key = `user:${id}:jtis`;
    await this.redis.client.del(key);

      await this.prisma.user.update({
      where: { id: id },
      data: {
        jtis: [],
      },
    });
  }
 
  }