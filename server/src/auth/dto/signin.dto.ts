import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SigninDto {
  @ApiProperty({ example: 'alex@example.com', format: 'email' })
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email!: string;

  @ApiProperty({ example: 'abcx123', minLength: 1, format: 'password' })
  @IsString({ message: 'Password must be a string' })
  password!: string;
}
