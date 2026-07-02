import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description!: string;

  @IsOptional()
  @IsString()
  department?: string | null;
}