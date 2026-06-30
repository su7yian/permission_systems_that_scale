import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { can } from 'src/authorization/roleBasedAccess';
import { canReadDocuments } from 'src/authorization/readAccess';
import { canUpdateDocument } from 'src/authorization/updateAcess';
/**
 * Mirrors src/dal/documents/queries.ts  AND  src/dal/documents/mutations.ts.
 */
@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Queries ───────────────────────────────────────────────────────────────

  /**
   * Mirrors: getDocumentById()  in dal/documents/queries.ts
   */
  async getDocumentById(id: string, user: User) {
    const document = await this.prisma.document.findUnique({ where: { id : id, },   include: { 
    project: true // This pulls the related project data into the object
  } });
  if (!document) { 
    throw new NotFoundException('Not Found') }

    const project = document.project;
    
        if(!canReadDocuments(user, project)){ 
          throw new UnauthorizedException();
        }
        if(!can(user.role,"document:read:drafts")){
         throw new UnauthorizedException();
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
   

    if(!canReadDocuments(user, project)){ 
          throw new UnauthorizedException();
        }
    if(!can(user.role,"document:read:drafts")){
         throw new UnauthorizedException();
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

        if(!canReadDocuments(user, project)){ 
          throw new UnauthorizedException();
        }
        if(!can(user.role,"document:read:drafts")){
         throw new UnauthorizedException();
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
if (!can(user.role, "document:create")) {
  throw new UnauthorizedException('Not allowded!');
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
   */
  async updateDocument(user: User, documentId: string, dto: UpdateDocumentDto) {
    // PERMISSION:
if(!canUpdateDocument){
  throw new UnauthorizedException();
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
if (!can(user.role, "document:delete")) {
  throw new UnauthorizedException('Not allowded!');
}

    return this.prisma.document.delete({ where: { id: documentId } });
  }
}
