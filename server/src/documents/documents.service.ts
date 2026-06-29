import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthorizationError } from '../common/errors/authorization.error';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { ProjectScalarFieldEnum } from 'src/generated/prisma/internal/prismaNamespace';
import { NotFoundError } from 'rxjs';

/**
 * Mirrors src/dal/documents/queries.ts  AND  src/dal/documents/mutations.ts.
 *
 * BRANCH 1 PERMISSION RULES (preserved exactly — intentional flaws included):
 *
 *   getDocumentById         → NO permission check
 *   getProjectDocuments     → NO permission check
 *   getDocumentWithUserInfo → NO permission check
 *
 *   createDocument  → blocks null + editor
 *                     ⚠️  INTENTIONAL FLAW: "viewer" role is NOT blocked here!
 *                     The original comment says: "FIX: Missing viewer role check"
 *                     This is a deliberate learning moment — do NOT fix it.
 *
 *   updateDocument  → blocks null + viewer  (editor/author/admin can update)
 *   deleteDocument  → admin only
 */
@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Queries ───────────────────────────────────────────────────────────────

  /**
   * Mirrors: getDocumentById()  in dal/documents/queries.ts
   * No permission check.
   */
  async getDocumentById(id: string, user: User) {
    const document = await this.prisma.document.findUnique({ where: { id : id, },   include: { 
    project: true // This pulls the related project data into the object
  } });
  if (!document) { 
    throw new NotFoundException('Not Found') }

    const project = document.project;
  if(user.role!=='admin' && user.department !== project.department){
    throw new ForbiddenException('Access denied')
  }
    return document;
  }

  /**
   * Mirrors: getProjectDocuments()  in dal/documents/queries.ts
   * Drizzle join → Prisma select with nested relation.
   * No permission check.
   */
  async getProjectDocuments(projectId: string, user: User) {
      const project = await this.prisma.project.findUnique({
    where: { id: projectId },
    select: { department: true }
  });

  // 2. Fail early if the project does not exist
  if (!project) {
    throw new NotFoundException('Project not found');
  }
   
  if(user.role!=='admin' && user.department !== project.department){
    throw new ForbiddenException('Access denied')
  }
    return this.prisma.document.findMany({
      where: { projectId },
      select: {
        id: true,
        title: true,
        status: true,
        isLocked: true,
        createdAt: true,
        projectId: true,
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
   
  }

  /**
   * Mirrors: getDocumentWithUserInfo()  in dal/documents/queries.ts
   * Drizzle with: { creator, lastEditedBy } → Prisma include.
   * No permission check.
   */
  async getDocumentWithUserInfo(id: string, user: User) {
    const document= await this.prisma.document.findUnique({
      where: { id },
      include: {
        creator:      { select: { name: true } },
        lastEditedBy: { select: { name: true } },
        project: true, // This pulls the related project data into the object
  } });
  if (!document) { 
    throw new NotFoundException('Not Found') }

    const project = document.project;
  if(user.role!=='admin' && user.department !== project.department){
    throw new ForbiddenException('Access denied')
  }
    return document;
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  /**
   * Mirrors: createDocument()  in dal/documents/mutations.ts
   */
  async createDocument(user: User, projectId: string, dto: CreateDocumentDto) {
    // PERMISSION:
    // FIX: Missing viewer role check
    if (user.role !== 'admin' && user.role !== 'author') {
      throw new AuthorizationError('Not allowded!');
    }

    return this.prisma.document.create({
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status,
        isLocked: dto.isLocked,
        projectId,
        creatorId: user.id,
        lastEditedById: user.id,
      },
    });
  }

  /**
   * Mirrors: updateDocument()  in dal/documents/mutations.ts
   *
   * PERMISSION:
   * if (user == null || user.role === "viewer") { throw new AuthorizationError() }
   *
   * Result table:
   *   null   → 403 Forbidden
   *   viewer → 403 Forbidden
   *   editor → ✅ ALLOWED
   *   author → ✅ ALLOWED
   *   admin  → ✅ ALLOWED
   */
  async updateDocument(user: User, documentId: string, dto: UpdateDocumentDto) {
    // PERMISSION:
    if (user.role === 'viewer') {
      throw new AuthorizationError();
    }

    return this.prisma.document.update({
      where: { id: documentId },
      data: {
        ...dto,
        lastEditedById: user.id,
      },
    });
  }

  /**
   Mirrors: deleteDocument()  in dal/documents/mutations.ts
   */
  async deleteDocument(user: User, documentId: string) {
    // PERMISSION:
    if (user.role !== 'admin') {
      throw new AuthorizationError();
    }

    return this.prisma.document.delete({ where: { id: documentId } });
  }
}