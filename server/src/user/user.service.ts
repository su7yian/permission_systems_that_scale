import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PayloadType } from '../auth/payload-type';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import * as argon2 from 'argon2';
import { JtiService } from '../auth/jti/jti.service';

@Injectable()
export class UserService {
constructor(
    private readonly prisma: PrismaService,
    private readonly jtiService: JtiService
) {}

  async getProfile(payload: PayloadType) {

    return this.prisma.user.findUnique({
      where: { email: payload.email },
      select: { id: true, name: true, email: true, department: true, role: true },
    });
  }

async changePassword(dto: UpdatePasswordDTO, payload: PayloadType) {
    const user = await this.prisma.user.findUnique({ where: { email: payload.email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const matched = await argon2.verify(user.password, dto.old_password);
    
    if (!matched) {
      throw new UnauthorizedException('Incorrect password');
    }

    const hashedPassword = await argon2.hash(dto.new_password);

    await this.prisma.user.update({
      where: { email: payload.email },
      data: { password: hashedPassword },
    });
     // Invalidate the JTI in Redis and database for all sessions of the user after password change
    await this.jtiService.deleteAllJTIs(payload.id);
     return true;

}
}