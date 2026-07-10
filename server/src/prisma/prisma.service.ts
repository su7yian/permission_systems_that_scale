import { Injectable } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService extends PrismaClient {
  constructor(config: ConfigService) {
    const adapter = new PrismaPg({
      connectionString: config.get<string>('DATABASE_URL'),
    });
    super({ adapter });
  }
    async CleanDb() {
    return this.$transaction([ //ensures order of delete operations...
      this.document.deleteMany(),
      this.project.deleteMany(),
      this.user.deleteMany(),
    ]);
}
}
