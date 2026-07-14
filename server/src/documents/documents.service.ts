import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PayloadType } from '../auth/payload-type';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { can } from '../access-control/roleBasedAccess';
import { canReadDocument } from '../access-control/readAccess';
import { canUpdateDocument } from '../access-control/updateAcess';
import { documentsWhereClause } from '../access-control/userWhereClause';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getDocumentById(id: string, payload: PayloadType) {
    const document = await this.prisma.document.findUnique({
      where: { id: id },
      include: {
        project: true, // This pulls the related project data into the object
      },
    });
    if (!document) {
      throw new NotFoundException('Not Found');
    }

    if (!canReadDocument(payload, document)) {
      throw new ForbiddenException();
    }

    return document;
  }

  async getProjectDocuments(project_id: string, payload: PayloadType) {
    return this.prisma.document.findMany({
      where: {
        AND: [{ projectId: project_id }, documentsWhereClause(payload) ?? {}],
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
  }

  async getDocumentWithUserInfo(id: string, payload: PayloadType) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true } },
        lastEditedBy: { select: { name: true } },
        project: true, // This pulls the related project data into the object
      },
    });
    if (!document) {
      throw new NotFoundException('Not Found');
    }

    if (!canReadDocument(payload, document)) {
      throw new ForbiddenException();
    }
    return document;
  }

  async createDocument(
    payload: PayloadType,
    projectId: string,
    dto: CreateDocumentDto,
  ) {
    if (!can(payload.role, 'document:create')) {
      throw new ForbiddenException('Not allowded!');
    }
    return this.prisma.document.create({
      data: {
        title: dto.title,
        content: dto.content,
        status: dto.status,
        isLocked: dto.isLocked,
        projectId,
        creatorId: payload.id,
        lastEditedById: payload.id,
      },
    });
  }

  async updateDocument(
    payload: PayloadType,
    documentId: string,
    dto: UpdateDocumentDto,
  ) {
    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
      include: { project: { select: { department: true } } },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (!canUpdateDocument(payload, document)) {
      throw new ForbiddenException();
    }
    return this.prisma.document.update({
      where: { id: documentId },
      data: {
        ...dto,
        lastEditedById: payload.id,
      },
    });
  }

  async deleteDocument(payload: PayloadType, documentId: string) {
    if (!can(payload.role, 'document:delete')) {
      throw new ForbiddenException('Not allowded!');
    }

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });
    if (!document) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.document.delete({ where: { id: documentId } });
  }
}
