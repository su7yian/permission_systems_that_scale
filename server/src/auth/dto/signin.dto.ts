import { IsEmail, IsString } from 'class-validator';

export class SigninDto {
  @IsEmail({}, { message: 'Please enter a valid email address' })
  email!: string;
  @IsString({ message: 'Password must be a string' })
  password!: string;
}