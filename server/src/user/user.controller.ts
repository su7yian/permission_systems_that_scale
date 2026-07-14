import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { UserService } from './user.service';
import { PayloadType } from '../auth/payload-type';
import { JwtAccessGuard } from '../auth/guards/jwt.guard';
import { CurrentPayload } from '../decorators/current-payload.decorator';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('User')
@ApiBearerAuth('access-token')
@UseGuards(JwtAccessGuard)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('profile')
  @ApiOperation({ summary: 'Get the current user profile' })
  @ApiResponse({ status: 200, description: 'Profile returned successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Access token is invalid or expired.',
  })
  async getProfile(@CurrentPayload() payload: PayloadType) {
    return this.userService.getProfile(payload);
  }

  @Patch('password')
  @ApiOperation({ summary: 'Change the current user password' })
  @ApiResponse({
    status: 200,
    description: 'Password changed and all sessions invalidated.',
  })
  @ApiResponse({
    status: 401,
    description: 'Current password is incorrect or access token is invalid.',
  })
  @ApiResponse({ status: 404, description: 'User not found.' })
  async changePassword(
    @Body() dto: UpdatePasswordDTO,
    @CurrentPayload() payload: PayloadType,
  ) {
    // Implementation for changing password
    return this.userService.changePassword(dto, payload);
  }
}
