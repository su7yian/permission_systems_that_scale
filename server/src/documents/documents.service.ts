import { Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { User } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { can } from 'src/authorization/roleBasedAccess';
import { canReadDocument } from 'src/authorization/readAccess';
import { canUpdateDocument } from 'src/authorization/updateAcess';
import { documentsWhereClause } from '../authorization/userWhereClause';
 
@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Queries ───────────────────────────────────────────────────────────────

    async getDocumentById(id: string, user: User) {
    const document = await this.prisma.document.findUnique({ where: { id : id, },   include: { 
    project: true // This pulls the related project data into the object
  } });
  if (!document) { 
    throw new NotFoundException('Not Found') }
    
        if(!canReadDocument(user, document)){ 
          throw new UnauthorizedException();
        }
    
    return document;
}

  
  async getProjectDocuments(project_id: string, user: User ) {
 
    const document = await this.prisma.document.findMany({
      where: {
        AND: [
        {projectId: project_id},
        documentsWhereClause(user) ?? {}
        ],
      },
      select: {
        id: true,
        title: true,
        status: true,
        isLocked: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });
      if (!document) {
    throw new NotFoundException('Project not found');
  }
  return document;
  }

   // Mirrors: getDocumentWithUserInfo()  in dal/documents/queries.ts
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

        if(!canReadDocument(user, document)){ 
          throw new UnauthorizedException();
        }
    return document;
  }

  // ── Mutations ─────────────────────────────────────────────────────────────
  
  async createDocument(user: User, projectId: string, dto: CreateDocumentDto) {
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
   
  async deleteDocument(user: User, documentId: string) {
    // PERMISSION:
if (!can(user.role, "document:delete")) {
  throw new UnauthorizedException('Not allowded!');
}

    return this.prisma.document.delete({ where: { id: documentId } });
  }

}
