    import { IsBoolean, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

    export class UpdateDocumentDto {
    
      @IsString()
      @IsOptional()
      title?: string;
    
      @IsString()
      @IsOptional()
      content?: string;
    
      @IsIn(['draft', 'published', 'archived'])
      @IsOptional()
      status?: 'draft' | 'published' | 'archived';
    
      @IsBoolean()
      isLocked?: boolean;
    }
