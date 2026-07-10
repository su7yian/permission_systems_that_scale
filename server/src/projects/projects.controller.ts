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
import { PayloadType } from '../auth/payload-type';
import { JwtAccessGuard } from '../auth/guards/jwt.guard';
import { CurrentPayload } from '../decorators/current-payload.decorator';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('projects')
@UseGuards(JwtAccessGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  getAllProjects(
    @CurrentPayload() payload: PayloadType,
    @Query('ordered') ordered?: boolean,
  ) {
    return this.projectsService.getAllProjects(payload, ordered);
  }

  @Get(':id')
  getProjectById(@Param('id') id: string, @CurrentPayload() payload: PayloadType,
  ) {
    return this.projectsService.getProjectById(id, payload);
  }

  @Post()
  createProject(
    @CurrentPayload() payload: PayloadType,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.createProject(payload, dto);
  }

  @Put(':id')
  updateProject(
    @CurrentPayload() payload: PayloadType,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(payload, id, dto,);
  }

  @Delete(':id')
  deleteProject(
    @CurrentPayload() payload: PayloadType,
    @Param('id') id: string,
  ) {
    return this.projectsService.deleteProject(payload, id);
  }
}