import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config/dist/config.service";
import { PassportStrategy } from "@nestjs/passport/dist/passport/passport.strategy";
import { PayloadType } from "../payload-type";
import { ExtractJwt, Strategy } from "passport-jwt";
import { JtiService } from "../jti/jti.service";


@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'accessJwt') {
  constructor(
    config: ConfigService,
    private readonly jtiService: JtiService
  ) {
    const secret = config.get<string>('ACCESS_TOKEN_SECRET');
    if (!secret) {
      throw new Error('ACCESS_TOKEN_SECRET is not defined in the environment variables');
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