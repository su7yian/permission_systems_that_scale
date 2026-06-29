import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { Prisma, User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthorizationError } from '../common/errors/authorization.error';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

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
   * PERMISSION: must be authenticated; role determines filter.
   */
  async getAllProjects(user: User, ordered: boolean = false) {

    return this.prisma.project.findMany({
      where: this.userWhereClause(user),
      orderBy: ordered ? { name: 'asc' } : undefined,
    });
  }

  /**
   * Mirrors: getProjectById()  in dal/projects/queries.ts
   * PERMISSION: none (intentional in Branch 1)
   */
  async getProjectById(id: string, user: User) {
        const project= await this.prisma.project.findUnique({ where: { id } });
       if (!project){
       throw new NotFoundException('Not found');
      }
      if(user.role !=='admin' && user.department !== project.department){
         throw new ForbiddenException('Access denied');
  }
       return project;
       }
  // ── Mutations ─────────────────────────────────────────────────────────────

  /**
   * Mirrors: createProject()  in dal/projects/mutations.ts
   * PERMISSION: admin only
   */
  async createProject(user: User, dto: CreateProjectDto) {
    // PERMISSION:
    if (user.role !== 'admin') {
      throw new AuthorizationError();
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
    if (user.role !== 'admin') {
      throw new AuthorizationError();
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
    if (user.role !== 'admin') {
      throw new AuthorizationError();
    }

    return this.prisma.project.delete({ where: { id: projectId } });
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

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
        // Drizzle: return undefined  → no WHERE = all projects
        return undefined;
      default:
        throw new Error(`Unhandled user role: ${user.role}`);
    }
  }
}