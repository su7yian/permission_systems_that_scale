import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SigninDto } from './dto/signin.dto';
import { SignupDto } from './dto/signup.dto';
import * as argon2 from "argon2";
import { User } from '../generated/prisma/browser';
import { PayloadType } from './payload-type';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { JtiService } from './jti/jti.service';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '../generated/prisma/client';


@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly jtiService: JtiService,
    private readonly config: ConfigService
  ) {}

  async signin(dto: SigninDto): Promise<{ access_token: string; refresh_token: string }> {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await argon2.verify(user.password, dto.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.generateFreshTokens(user);
  }


  //----------------------------------------------------------------------------------------------------------

  async signup(dto: SignupDto): Promise<{ access_token: string; refresh_token: string }> {
    const hashedPassword = await argon2.hash(dto.password);
    let user: User;
    try {
      user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        name: dto.name,
        department: dto.department,
          },
        });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email already exists');
      } else {
      throw new InternalServerErrorException('An error occurred during signup');
    }
  }
    return this.generateFreshTokens(user);
  }
//----------------------------------------------------------------------------------------------------------

private async generateFreshTokens(user: User): Promise<{ access_token: string; refresh_token: string }> {
  // Implementation for token generation
      const payload: PayloadType = {
      id: user.id,
      email: user.email,
      role: user.role,
      department: user.department,
      jti: randomUUID(),
    };
     await this.jtiService.addJTI(user.id, payload.jti); // Store the JTI in Redis and database
     const access_token = await this.jwtService.sign(payload, {
      secret: this.config.get('ACCESS_TOKEN_SECRET'),
      expiresIn: '15m',
    });

     const refresh_token = await this.jwtService.sign(payload, {
      secret: this.config.get('REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });

    return { access_token, refresh_token };
  }

//----------------------------------------------------------------------------------------------------------


  async refresh(old_payload: PayloadType) : Promise<{ access_token: string; refresh_token: string }> {
    // invlalidate previous session as part of token rotation.
      await this.jtiService.removeJTI(old_payload.id, old_payload.jti);
    // create new paylaod with new jti and generate new tokens.

      const payload: PayloadType = {
      id: old_payload.id,
      email: old_payload.email,
      role: old_payload.role,
      department: old_payload.department,
      jti: randomUUID(),
    };
    // Store the JTI in Redis and database
     await this.jtiService.addJTI(payload.id, payload.jti); 

     const access_token = await this.jwtService.sign(payload, {
      secret: this.config.get('ACCESS_TOKEN_SECRET'),
      expiresIn: '15m',
    });

     const refresh_token = await this.jwtService.sign(payload, {
      secret: this.config.get('REFRESH_TOKEN_SECRET'),
      expiresIn: '7d',
    });
      return { access_token, refresh_token };
  }  
//----------------------------------------------------------------------------------------------------------

    async signout(old_payload: PayloadType): Promise<void> {
    // Invalidate the JTI in Redis and database to sign out the user
    await this.jtiService.removeJTI(old_payload.id, old_payload.jti);
  }
} 