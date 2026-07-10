import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { PayloadType } from './payload-type';
import { JwtAccessGuard, JwtRefreshGuard } from './guards/jwt.guard';
import { CurrentPayload } from '../decorators/current-payload.decorator';



@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  async signin(@Body() dto: SigninDto) {
    return await this.authService.signin(dto);
  }
  
  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return await this.authService.signup(dto);
}
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@CurrentPayload() payload: PayloadType) {
    return await this.authService.refresh(payload);
  }

 @UseGuards(JwtAccessGuard)
  @Get('signout')
  async signout(@CurrentPayload() payload: PayloadType) {
     await this.authService.signout(payload);
     return true;
  }

}
