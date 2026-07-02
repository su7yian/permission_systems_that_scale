import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

/**
 *   login()   → validates email, looks up user, returns userId (replaces setSession)
 *   logout()  → no-op in pure API mode (replaces clearSession)
 *
 * In the original Next.js app, getCurrentUser() reads from a cookie session.
 * Here, we return a userId on login and the client passes it as x-user-id header.
 * The AuthGuard reads that header on every protected request, same logical flow.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  
   // GET /auth/users
  

  @Get('users')
  async getUsers() {
    return this.authService.getUsers();
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.getUserByEmail(dto.email);

    if (user == null) {
      return { message: 'User not found' };
    }

    return {
      message: 'Login successful',
      userId: user.id,
      name: user.name,
      role: user.role,
      department: user.department,
      instruction: 'Pass userId as the "x-user-id" header in all subsequent requests.',
    };
  }

  @Post('logout')
  logout() {
    return { message: 'Logged out. Stop sending the x-user-id header.' };
  }
}