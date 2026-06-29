import { IsOptional, IsString, MinLength } from 'class-validator';

/**
 * Mirrors the Zod projectSchema from src/schemas/projects.ts:
 *   name        → string, min 1
 *   description → string, min 1
 *   department  → string (optional in NestJS — may be empty string or absent)
 */
export class CreateProjectDto {
  @IsString()
  @MinLength(1, { message: 'Name is required' })
  name: string;

  @IsString()
  @MinLength(1, { message: 'Description is required' })
  description: string;

  @IsOptional()
  @IsString()
  department?: string;
}