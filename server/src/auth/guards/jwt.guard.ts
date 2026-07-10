import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAccessGuard extends AuthGuard('accessJwt') {
  constructor() {
    super();
  }
}

export class JwtRefreshGuard extends AuthGuard('refreshJwt') {
  constructor() {
    super();
  }
}
