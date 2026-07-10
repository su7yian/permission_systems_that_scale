import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { UpdatePasswordDTO } from './dto/update-password.dto';
import { UserService } from './user.service';
import { PayloadType } from '../auth/payload-type';
import { JwtAccessGuard } from '../auth/guards/jwt.guard';
import { CurrentPayload } from '../decorators/current-payload.decorator';


@UseGuards(JwtAccessGuard)
@Controller('user')
export class UserController {
    constructor(private readonly userService: UserService) {}
@Get('profile')
    async getProfile(@CurrentPayload() payload: PayloadType) {
        return this.userService.getProfile(payload);
    }

@Patch('password')
    async changePassword(@Body() dto: UpdatePasswordDTO, @CurrentPayload() payload: PayloadType) {
        // Implementation for changing password
        return this.userService.changePassword(dto, payload);
    }
}
 