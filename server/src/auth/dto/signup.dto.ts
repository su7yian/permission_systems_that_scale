import { IsEmail, IsString } from 'class-validator';
import { UserRole } from '../../generated/prisma/browser';

export class SignupDto {
  @IsEmail()
  email!: string;

  @IsString()
  name!: string;

  @IsString()
   password!: string;

  @IsString()
   role!: UserRole;

  @IsString()
  department!: string;

}
