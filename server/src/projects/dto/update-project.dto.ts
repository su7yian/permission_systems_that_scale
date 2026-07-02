import { IsOptional, IsString, IsNotEmpty } from 'class-validator';

export class UpdateProjectDto {
      @IsString()
      @IsOptional()
      name?: string;
    
      @IsString()
      @IsOptional()
      description?: string;
    
      @IsOptional()
      @IsString()
      department?: string | null;
    }
    