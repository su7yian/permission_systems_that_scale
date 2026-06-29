import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { User } from '../generated/prisma/client';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

/**
 * Mirrors src/actions/projects.ts server actions as REST endpoints.
 * All routes require x-user-id header (enforced by AuthGuard).
 */
@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  /**
   * GET /projects
   * GET /projects?ordered=true
   * Mirrors: createProjectAction → getAllProjects()
   */
  @Get()
  getAllProjects(
    @CurrentUser() user: User,
    @Query('ordered') ordered?: string,
  ) {
    return this.projectsService.getAllProjects(user, ordered === 'true');
  }

  /**
   * GET /projects/:id
   * No permission check (intentional Branch 1 flaw)
   */
  @Get(':id')
  getProjectById(@Param('id') id: string, @CurrentUser() user: User,
  ) {
    return this.projectsService.getProjectById(id, user);
  }

  /**
   * POST /projects
   * Mirrors: createProjectAction
   * PERMISSION: admin only
   */
  @Post()
  createProject(
    @CurrentUser() user: User,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.createProject(user, dto);
  }

  /**
   * PUT /projects/:id
   * Mirrors: updateProjectAction
   * PERMISSION: admin only
   */
  @Put(':id')
  updateProject(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(user, id, dto);
  }

  /**
   * DELETE /projects/:id
   * Mirrors: deleteProjectAction
   * PERMISSION: admin only
   */
  @Delete(':id')
  deleteProject(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.projectsService.deleteProject(user, id);
  }
}