import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UpdatePasswordDTO {
  @ApiProperty({ example: 'old-password', format: 'password' })
  @IsString()
  @IsNotEmpty()
  old_password!: string;
  @ApiProperty({ example: 'new-password', format: 'password' })
  @IsString()
  @IsNotEmpty()
  new_password!: string;
}
