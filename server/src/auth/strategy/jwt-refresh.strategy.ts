import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { PayloadType } from "../payload-type";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JtiService } from "../jti/jti.service";


@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'refreshJwt') {
  constructor(
    config: ConfigService,
    private readonly jtiService: JtiService
  ) {
    const secret = config.get<string>('REFRESH_TOKEN_SECRET');
    if (!secret) {
      throw new Error('REFRESH_TOKEN_SECRET is not defined in the environment variables');
    }
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: secret,
    });
  }

  async validate(payload: PayloadType) {
    const isactive = await this.jtiService.isJTIValid(payload.id, payload.jti);

    if (!isactive) {
      throw new UnauthorizedException('Invalid token');
    }

    return payload;
  }
}