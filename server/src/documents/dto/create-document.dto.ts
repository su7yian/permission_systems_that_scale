import { IsBoolean, IsIn, IsString, MinLength } from 'class-validator';

/**
 * Mirrors the Zod documentSchema from src/schemas/documents.ts:
 *   title    → string, min 1
 *   content  → string, min 1
 *   status   → enum: draft | published | archived
 *   isLocked → boolean
 *
 * Note: We use @IsIn() instead of @IsEnum() to avoid needing Prisma
 * client generation as a compile-time dependency in the DTO layer.
 */
export class CreateDocumentDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  title: string;

  @IsString()
  @MinLength(1, { message: 'Content is required' })
  content: string;

  @IsIn(['draft', 'published', 'archived'], {
    message: 'status must be one of: draft, published, archived',
  })
  status: 'draft' | 'published' | 'archived';

  @IsBoolean()
  isLocked: boolean;
}