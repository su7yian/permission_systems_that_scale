    import { ApiPropertyOptional } from '@nestjs/swagger';
    import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

    export class UpdateDocumentDto {
    
      @ApiPropertyOptional({ example: 'Updated incident response guide' })
      @IsString()
      @IsOptional()
      title?: string;
    
      @ApiPropertyOptional({ example: 'Updated response instructions.' })
      @IsString()
      @IsOptional()
      content?: string;
    
      @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'], example: 'published' })
      @IsIn(['draft', 'published', 'archived'])
      @IsOptional()
      status?: 'draft' | 'published' | 'archived';
    
      @ApiPropertyOptional({ example: true })
      @IsBoolean()
      isLocked?: boolean;
    }
