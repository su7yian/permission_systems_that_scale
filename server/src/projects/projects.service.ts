import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import {  User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { can } from 'src/authorization/roleBasedAccess';
import { canReadProject } from '../authorization/readAccess';
import { projectsWhereClause } from '../authorization/userWhereClause';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}
  
  async getAllProjects(user: User, ordered: boolean = false) {

    return this.prisma.project.findMany({
      where: projectsWhereClause(user),
      orderBy: ordered ? { name: 'asc' } : undefined,
    });
  }

  async getProjectById(id: string, user: User) {
        const project= await this.prisma.project.findUnique({ where: { id } });
       if (!project){
       throw new NotFoundException('Not found');
      }
        if(!canReadProject(user, project)){ 
          throw new UnauthorizedException();
        }
      return project;
       }

  async createProject(user: User, dto: CreateProjectDto) {
if (!can(user.role, "project:create")) {
  throw new UnauthorizedException('Not allowded!');
}

    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: user.id,
        department: dto.department || null,
      },
    });
  }

  async updateProject(user: User, projectId: string, dto: UpdateProjectDto) {
    // PERMISSION:
if (!can(user.role, "project:update")) {
  throw new UnauthorizedException('Not allowded!');
}

    return this.prisma.project.update({
      where: { id: projectId },
      data: dto,
    });
  }

  async deleteProject(user: User, projectId: string) {
    if (!can(user.role, "project:delete")) {
      throw new UnauthorizedException('Not allowded!');
    }

    return this.prisma.project.delete({ where: { id: projectId } });
  }
}
