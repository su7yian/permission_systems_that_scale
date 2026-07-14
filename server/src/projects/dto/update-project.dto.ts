import { IsOptional, IsString, IsNotEmpty } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProjectDto {
  @ApiPropertyOptional({ example: 'Updated knowledge base' })
      @IsString()
      @IsOptional()
      name?: string;
    
  @ApiPropertyOptional({ example: 'Updated project description' })
      @IsString()
      @IsOptional()
      description?: string;
    
  @ApiPropertyOptional({ example: 'support', nullable: true })
      @IsOptional()
      @IsString()
      department?: string | null;
    }
    