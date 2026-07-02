import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 *   getUsers()        → prisma.user.findMany()
 *   getUserByEmail()  → prisma.user.findUnique({ where: { email } })
 *   getUserById()     → prisma.user.findUnique({ where: { id } })
 */
@Injectable()
export class AuthService {
  constructor(private readonly prisma: PrismaService) {}

  async getUsers() {
    return this.prisma.user.findMany();
  }

  async getUserByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async getUserById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }
}