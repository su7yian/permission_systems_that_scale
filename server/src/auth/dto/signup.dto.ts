import { IsEmail, IsString } from 'class-validator';
import { UserRole } from '../../generated/prisma/browser';
import { ApiProperty } from '@nestjs/swagger';

export class SignupDto {
  @ApiProperty({ example: 'alex@example.com', format: 'email' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'Alex Morgan' })
  @IsString()
  name!: string;

  @ApiProperty({ example: 'abcx123', format: 'password' })
  @IsString()
   password!: string;

  @ApiProperty({ enum: UserRole, example: UserRole.viewer })
  @IsString()
   role!: UserRole;

  @ApiProperty({ example: 'engineering' })
  @IsString()
  department!: string;

}
