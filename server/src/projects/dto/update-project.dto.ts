import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';

/**
 * All fields are optional for PATCH/PUT updates.
 * PartialType automatically makes every field from CreateProjectDto optional
 * while keeping the same validation decorators active when a field IS supplied.
 */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}