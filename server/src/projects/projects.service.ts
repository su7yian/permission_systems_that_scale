import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PayloadType } from '../auth/payload-type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { can } from '../access-control/roleBasedAccess';
import { canReadProject } from '../access-control/readAccess';
import { projectsWhereClause } from '../access-control/userWhereClause';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllProjects(payload: PayloadType, ordered: boolean = false) {
    return this.prisma.project.findMany({
      where: projectsWhereClause(payload),
      orderBy: ordered ? { name: 'asc' } : undefined,
    });
  }

  async getProjectById(id: string, payload: PayloadType) {
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) {
      throw new NotFoundException('Not found');
    }
    if (!canReadProject(payload, project)) {
      throw new ForbiddenException();
    }
    return project;
  }

  async createProject(payload: PayloadType, dto: CreateProjectDto) {
    if (!can(payload.role, 'project:create')) {
      throw new ForbiddenException('Not allowded!');
    }

    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: payload.id,
        department: dto.department || null,
      },
    });
  }

  async updateProject(
    payload: PayloadType,
    projectId: string,
    dto: UpdateProjectDto,
  ) {
    // PERMISSION:
    if (!can(payload.role, 'project:update')) {
      throw new ForbiddenException('Not allowded!');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: dto,
    });
  }

  async deleteProject(payload: PayloadType, projectId: string) {
    if (!can(payload.role, 'project:delete')) {
      throw new ForbiddenException('Not allowded!');
    }

    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    return this.prisma.project.delete({ where: { id: projectId } });
  }
}
