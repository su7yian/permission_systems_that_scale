import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { User } from '../generated/prisma/client';
import { AuthGuard } from '../common/guards/auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

/**
 * Mirrors src/actions/documents.ts server actions as REST endpoints.
 * All routes require x-user-id header (enforced by AuthGuard).
 *
 * Route structure mirrors the Next.js URL patterns:
 *   /projects/:projectId/documents  → project-scoped document listing & creation
 *   /documents/:id                  → individual document operations
 */
@Controller()
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * GET /projects/:projectId/documents
   * Mirrors: getProjectDocuments() — no permission check (Branch 1)
   */
  @Get('projects/:projectId/documents')
  getProjectDocuments(@Param('projectId') projectId: string, @CurrentUser() user: User) {
    return this.documentsService.getProjectDocuments(projectId, user);
  }

  /**
   * GET /documents/:id
   * Mirrors: getDocumentById() — no permission check (Branch 1)
   */
  @Get('documents/:id')
  getDocumentById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.documentsService.getDocumentById(id, user);
  }

  /**
   * GET /documents/:id/full
   * Mirrors: getDocumentWithUserInfo() — includes creator & lastEditedBy names
   * No permission check (Branch 1)
   */
  @Get('documents/:id/full')
  getDocumentWithUserInfo(@Param('id') id: string,  @CurrentUser() user: User) {
    return this.documentsService.getDocumentWithUserInfo(id, user);
  }

  /**
   * POST /projects/:projectId/documents
   * Mirrors: createDocumentAction
   * PERMISSION: ⚠️ blocks editor (but NOT viewer — intentional Branch 1 flaw)
   */
  @Post('projects/:projectId/documents')
  createDocument(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.createDocument(user, projectId, dto);
  }

  /**
   * PUT /documents/:id
   * Mirrors: updateDocumentAction
   * PERMISSION: blocks viewer; editor/author/admin can update
   */
  @Put('documents/:id')
  updateDocument(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.updateDocument(user, id, dto);
  }

  /**
   * DELETE /documents/:id
   * Mirrors: deleteDocumentAction
   * PERMISSION: admin only
   */
  @Delete('documents/:id')
  deleteDocument(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.documentsService.deleteDocument(user, id);
  }
}