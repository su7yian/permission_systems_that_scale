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

@Controller()
@UseGuards(AuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('projects/:projectId/documents')
  getProjectDocuments(@Param('projectId') projectId: string, @CurrentUser() user: User) {
    return this.documentsService.getProjectDocuments(projectId, user);
  }

  @Get('documents/:id')
  getDocumentById(@Param('id') id: string, @CurrentUser() user: User) {
    return this.documentsService.getDocumentById(id, user);
  }

  @Get('documents/:id/full')
  getDocumentWithUserInfo(@Param('id') id: string,  @CurrentUser() user: User) {
    return this.documentsService.getDocumentWithUserInfo(id, user);
  }

  @Post('projects/:projectId/documents')
  createDocument(
    @CurrentUser() user: User,
    @Param('projectId') projectId: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.createDocument(user, projectId, dto);
  }

  @Put('documents/:id')
  updateDocument(
    @CurrentUser() user: User,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.updateDocument(user, id, dto);
  }

  @Delete('documents/:id')
  deleteDocument(
    @CurrentUser() user: User,
    @Param('id') id: string,
  ) {
    return this.documentsService.deleteDocument(user, id);
  }
}