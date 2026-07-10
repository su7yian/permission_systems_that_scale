import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class UpdatePasswordDTO{
    @IsString()
    @IsNotEmpty()
    old_password!: string;
    @IsString()
    @IsNotEmpty()
    new_password!: string;
}