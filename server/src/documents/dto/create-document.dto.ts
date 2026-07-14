import { IsBoolean, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Incident response guide' })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ example: 'Follow these steps when responding to an incident.' })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({ enum: ['draft', 'published', 'archived'], example: 'draft' })
  @IsIn(['draft', 'published', 'archived'])
  @IsNotEmpty()
  status!: 'draft' | 'published' | 'archived';

  @ApiPropertyOptional({ default: false, example: false })
  @IsBoolean()
  isLocked?: boolean;
}