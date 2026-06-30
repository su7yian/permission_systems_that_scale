import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Prisma, User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { can } from 'src/authorization/rbac';

/**
 * Mirrors src/dal/projects/queries.ts  AND  src/dal/projects/mutations.ts.
 *
 * BRANCH 1 PERMISSION RULES (preserved exactly — intentional flaws included):
 *
 *   getAllProjects  → must be authenticated; admin sees all, others see own-dept + null-dept
 *   getProjectById → NO permission check (intentional — anyone with x-user-id can call it)
 *   createProject  → admin only
 *   updateProject  → admin only
 *   deleteProject  → admin only
 */
@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Queries ───────────────────────────────────────────────────────────────

  /**
   * Mirrors: getAllProjects()  in dal/projects/queries.ts
   */
  
  async getAllProjects(user: User, ordered: boolean = false) {

    return this.prisma.project.findMany({
      where: this.userWhereClause(user),
      orderBy: ordered ? { name: 'asc' } : undefined,
    });
  }

  /**
   * Mirrors: getProjectById()  in dal/projects/queries.ts
   */
  async getProjectById(id: string, user: User) {
        const project= await this.prisma.project.findUnique({ where: { id } });
       if (!project){
       throw new NotFoundException('Not found');
      }
         this.requireSameDepartment(user, project.department);
       return project;
       }
  // ── Mutations ─────────────────────────────────────────────────────────────

  /**
   * Mirrors: createProject()  in dal/projects/mutations.ts
   * PERMISSION: admin only
   */
  async createProject(user: User, dto: CreateProjectDto) {
    // PERMISSION:
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

  /**
   * Mirrors: updateProject()  in dal/projects/mutations.ts
   * PERMISSION: admin only
   */
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

  /**
   * Mirrors: deleteProject()  in dal/projects/mutations.ts
   * PERMISSION: admin only
   */
  async deleteProject(user: User, projectId: string) {
    // PERMISSION:
    if (!can(user.role, "project:delete")) {
      throw new UnauthorizedException('Not allowded!');
    }

    return this.prisma.project.delete({ where: { id: projectId } });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
private requireSameDepartment(user: User, department: string | null) {
  if (user.role !== 'admin' && user.department !== department) {
    throw new UnauthorizedException('Access denied');
  }
}
  /**
   * Mirrors: userWhereClause()  in dal/projects/queries.ts
   * Returns the Prisma WHERE equivalent of Drizzle's or(eq(...), isNull(...)).
   */
  private userWhereClause(
    user: Pick<User, 'role' | 'department'>,
  ): Prisma.ProjectWhereInput | undefined {
    switch (user.role) {
      case 'author':
      case 'viewer':
      case 'editor':
        // Drizzle: or(eq(ProjectTable.department, user.department), isNull(ProjectTable.department))
        return {
          OR: [
            { department: user.department },
            { department: null },
          ],
        };
      case 'admin':
        //  return undefined  → no WHERE = all projects
        return undefined;
      default:
        throw new InternalServerErrorException(`Unhandled user role: ${user.role}`);
    }
  }
}