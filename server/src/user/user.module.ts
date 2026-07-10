import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { JwtAccessGuard } from '../auth/guards/jwt.guard';
import { JtiService } from '../auth/jti/jti.service';

@Module({
  controllers: [UserController],
  providers: [UserService, JwtAccessGuard, JtiService],
})
export class UserModule {}
