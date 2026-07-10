import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JtiService } from './jti/jti.service';
import { JwtService } from '@nestjs/jwt';
import { JwtAccessStrategy } from './strategy/jwt-access.strategy';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';

@Module({
  controllers: [AuthController],
  providers: [AuthService, JtiService, JwtService, JwtAccessStrategy, JwtRefreshStrategy],
})
export class AuthModule {}