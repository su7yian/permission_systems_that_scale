import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import { PayloadType } from './payload-type';
import { JwtAccessGuard, JwtRefreshGuard } from './guards/jwt.guard';
import { CurrentPayload } from '../decorators/current-payload.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signin')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in and receive access and refresh tokens' })
  @ApiResponse({ status: 200, description: 'Tokens issued successfully.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async signin(@Body() dto: SigninDto) {
    return await this.authService.signin(dto);
  }

  @Post('signup')
  @ApiOperation({ summary: 'Create a user account and receive tokens' })
  @ApiResponse({
    status: 201,
    description: 'Account created and tokens issued.',
  })
  @ApiResponse({ status: 409, description: 'Email already exists.' })
  async signup(@Body() dto: SignupDto) {
    return await this.authService.signup(dto);
  }
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  @ApiBearerAuth('refresh-token')
  @ApiOperation({ summary: 'Rotate access and refresh tokens' })
  @ApiResponse({ status: 201, description: 'New tokens issued successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Refresh token is invalid or expired.',
  })
  async refresh(@CurrentPayload() payload: PayloadType) {
    return await this.authService.refresh(payload);
  }

  @UseGuards(JwtAccessGuard)
  @Get('signout')
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Sign out and invalidate the current session' })
  @ApiResponse({ status: 200, description: 'Session invalidated.' })
  @ApiResponse({
    status: 401,
    description: 'Access token is invalid or expired.',
  })
  async signout(@CurrentPayload() payload: PayloadType) {
    await this.authService.signout(payload);
    return true;
  }
}
