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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Projects')
@ApiBearerAuth('access-token')
@Controller('projects')
@UseGuards(JwtAccessGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @ApiOperation({ summary: 'List projects visible to the current user' })
  @ApiQuery({
    name: 'ordered',
    required: false,
    type: Boolean,
    description: 'Sort projects by name in ascending order.',
  })
  @ApiResponse({ status: 200, description: 'Projects returned successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Access token is invalid or expired.',
  })
  getAllProjects(
    @CurrentPayload() payload: PayloadType,
    @Query('ordered') ordered?: boolean,
  ) {
    return this.projectsService.getAllProjects(payload, ordered);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a project by ID' })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    example: '7c2e6f35-2c0f-4f6f-8df5-6b8f0b8c6d12',
  })
  @ApiResponse({ status: 200, description: 'Project returned successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not allowed to read this project.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  getProjectById(
    @Param('id') id: string,
    @CurrentPayload() payload: PayloadType,
  ) {
    return this.projectsService.getProjectById(id, payload);
  }

  @Post()
  @ApiOperation({ summary: 'Create a project' })
  @ApiResponse({ status: 201, description: 'Project created successfully.' })
  @ApiResponse({ status: 400, description: 'Request body failed validation.' })
  @ApiResponse({
    status: 401,
    description: 'Access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not allowed to create projects.',
  })
  createProject(
    @CurrentPayload() payload: PayloadType,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.createProject(payload, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a project' })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    example: '7c2e6f35-2c0f-4f6f-8df5-6b8f0b8c6d12',
  })
  @ApiResponse({ status: 200, description: 'Project updated successfully.' })
  @ApiResponse({ status: 400, description: 'Request body failed validation.' })
  @ApiResponse({
    status: 401,
    description: 'Access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not allowed to update projects.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  updateProject(
    @CurrentPayload() payload: PayloadType,
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.updateProject(payload, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a project' })
  @ApiParam({
    name: 'id',
    description: 'Project UUID',
    example: '7c2e6f35-2c0f-4f6f-8df5-6b8f0b8c6d12',
  })
  @ApiResponse({ status: 200, description: 'Project deleted successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not allowed to delete projects.',
  })
  @ApiResponse({ status: 404, description: 'Project not found.' })
  deleteProject(
    @CurrentPayload() payload: PayloadType,
    @Param('id') id: string,
  ) {
    return this.projectsService.deleteProject(payload, id);
  }
}
