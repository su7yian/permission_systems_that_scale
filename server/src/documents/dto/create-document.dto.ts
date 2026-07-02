import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateDocumentDto {
  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsIn(['draft', 'published', 'archived'])
  @IsNotEmpty()
  status!: 'draft' | 'published' | 'archived';

  @IsBoolean()
  isLocked?: boolean;
}