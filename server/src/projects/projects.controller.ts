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

@Controller('projects')
@UseGuards(AuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  getAllProjects(
    @CurrentUser() user: User,
    @Query('ordered') ordered?: boolean,
  ) {
    return this.projectsService.getAllProjects(user, ordered);
  }

  @Get(':id')
  getProjectById(@Param('id') id: string, @CurrentUser() user: User,
  ) {
    return this.projectsService.getProjectById(id, user);
  }

  @Post()
  createProject(
    @CurrentUser() user: User,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.createProject(user, dto);
  }

  @Put(':id')
  updateProject(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(user, id, dto,);
  }

  @Delete(':id')
  deleteProject(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.projectsService.deleteProject(user, id);
  }
}