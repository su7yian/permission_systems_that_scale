import { User, Prisma } from '../generated/prisma/client';
import { InternalServerErrorException } from '@nestjs/common';
  
  export function projectsWhereClause(
    user: Pick<User, 'role' | 'department'>,
  ): Prisma.ProjectWhereInput | undefined {
    switch (user.role) {
      case 'author':
      return {
          OR: [
            { department: user.department },
            { department: null },
          ],
        };
      case 'viewer':
           return {
          OR: [
            { department: user.department },
            { department: null },
          ],
        };
      case 'editor':
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

  // --------------------------------------For many Documents--------------------------------------------

   export function documentsWhereClause(
    user: Pick<User, 'role' | 'department' | 'id' >,
  ): Prisma.DocumentWhereInput | undefined {
    switch (user.role) {
      case 'author':
      return {
          OR: [      
            { status: 'published', project: { department: null } },
            { status: 'published', project: { department: user.department } },
            { status: 'draft', creatorId: user.id },
          ],
        };
      case 'viewer':
           return {
          OR: [
              { status: 'published', project: { department: null } },
            { status: 'published', project: { department: user.department } },
          ],
        };
      case 'editor':
        return {
          OR: [
          { status: 'draft', project: { department: user.department } },
          { status: 'published', project: { department: null } },
          { status: 'published', project: { department: user.department } },
          ],
        };
      case 'admin':
        //  return undefined  → no WHERE = all projects
        return undefined;
      default:
        throw new InternalServerErrorException(`Unhandled user role: ${user.role}`);
    }
  }

