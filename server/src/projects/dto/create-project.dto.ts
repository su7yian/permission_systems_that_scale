import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProjectDto {
  @ApiProperty({ example: 'Knowledge base' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ example: 'Internal documentation for the support team' })
  @IsString()
  @IsOptional()
  description!: string;

  @ApiPropertyOptional({ example: 'support', nullable: true })
  @IsOptional()
  @IsString()
  department?: string | null;
}