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
import { PayloadType } from '../auth/payload-type';
import { CurrentPayload } from '../decorators/current-payload.decorator';
import { DocumentsService } from './documents.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import { JwtAccessGuard } from '../auth/guards/jwt.guard';

@Controller()
@UseGuards(JwtAccessGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('projects/:projectId/documents')
  getProjectDocuments(@Param('projectId') projectId: string, @CurrentPayload() payload: PayloadType) {
    return this.documentsService.getProjectDocuments(projectId, payload);
  }

  @Get('documents/:id')
  getDocumentById(@Param('id') id: string, @CurrentPayload() payload: PayloadType) {
    return this.documentsService.getDocumentById(id, payload);
  }

  @Get('documents/:id/full')
  getDocumentWithUserInfo(@Param('id') id: string,  @CurrentPayload() payload: PayloadType) {
    return this.documentsService.getDocumentWithUserInfo(id, payload);
  }

  @Post('projects/:projectId/documents')
  createDocument(
    @CurrentPayload() payload: PayloadType,
    @Param('projectId') projectId: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.createDocument(payload, projectId, dto);
  }

  @Put('documents/:id')
  updateDocument(
    @CurrentPayload() payload: PayloadType,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.updateDocument(payload, id, dto);
  }

  @Delete('documents/:id')
  deleteDocument(
    @CurrentPayload() payload: PayloadType,
    @Param('id') id: string,
  ) {
    return this.documentsService.deleteDocument(payload, id);
  }
}