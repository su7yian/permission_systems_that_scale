import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

/**
 * Mirrors src/actions/auth.ts:
 *   login()   → validates email, looks up user, returns userId (replaces setSession)
 *   logout()  → no-op in pure API mode (replaces clearSession)
 *
 * In the original Next.js app, getCurrentUser() reads from a cookie session.
 * Here, we return a userId on login and the client passes it as x-user-id header.
 * The AuthGuard reads that header on every protected request — same logical flow.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * GET /auth/users
   * Helper endpoint — lists all seeded users with their IDs, roles, and departments.
   * Use this after seeding to quickly grab userId values for testing.
   */
  @Get('users')
  async getUsers() {
    return this.authService.getUsers();
  }

  /**
   * POST /auth/login
   * Body: { "email": "admin.eng@example.com" }
   * Returns the userId to use as the x-user-id header in subsequent requests.
   */
  @Post('login')
  async login(@Body() dto: LoginDto) {
    const user = await this.authService.getUserByEmail(dto.email);

    if (user == null) {
      // Mirrors: if (user == null) return { message: "User not found" }
      return { message: 'User not found' };
    }

    // Mirrors: await setSession(user.id)
    // Instead of a cookie, we return the userId for use in the x-user-id header
    return {
      message: 'Login successful',
      userId: user.id,
      name: user.name,
      role: user.role,
      department: user.department,
      instruction: 'Pass userId as the "x-user-id" header in all subsequent requests.',
    };
  }

  /**
   * POST /auth/logout
   * Mirrors: clearSession() → redirect("/")
   * In API mode this is a no-op — the client simply stops sending the header.
   */
  @Post('logout')
  logout() {
    return { message: 'Logged out. Stop sending the x-user-id header.' };
  }
}