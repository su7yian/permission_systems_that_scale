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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Documents')
@ApiBearerAuth('access-token')
@Controller()
@UseGuards(JwtAccessGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  @Get('projects/:projectId/documents')
  @ApiOperation({ summary: 'List documents in a project' })
  @ApiParam({
    name: 'projectId',
    description: 'Project UUID',
    example: '7c2e6f35-2c0f-4f6f-8df5-6b8f0b8c6d12',
  })
  @ApiResponse({ status: 200, description: 'Documents returned successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Access token is invalid or expired.',
  })
  getProjectDocuments(
    @Param('projectId') projectId: string,
    @CurrentPayload() payload: PayloadType,
  ) {
    return this.documentsService.getProjectDocuments(projectId, payload);
  }

  @Get('documents/:id')
  @ApiOperation({ summary: 'Get a document by ID' })
  @ApiParam({
    name: 'id',
    description: 'Document UUID',
    example: '9d3e7c14-0f66-4e1e-a01e-3d28e5d9a2b8',
  })
  @ApiResponse({ status: 200, description: 'Document returned successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not allowed to read this document.',
  })
  @ApiResponse({ status: 404, description: 'Document not found.' })
  getDocumentById(
    @Param('id') id: string,
    @CurrentPayload() payload: PayloadType,
  ) {
    return this.documentsService.getDocumentById(id, payload);
  }

  @Get('documents/:id/full')
  @ApiOperation({
    summary: 'Get a document with creator, editor, and project information',
  })
  @ApiParam({
    name: 'id',
    description: 'Document UUID',
    example: '9d3e7c14-0f66-4e1e-a01e-3d28e5d9a2b8',
  })
  @ApiResponse({
    status: 200,
    description: 'Document and related information returned successfully.',
  })
  @ApiResponse({
    status: 401,
    description: 'Access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not allowed to read this document.',
  })
  @ApiResponse({ status: 404, description: 'Document not found.' })
  getDocumentWithUserInfo(
    @Param('id') id: string,
    @CurrentPayload() payload: PayloadType,
  ) {
    return this.documentsService.getDocumentWithUserInfo(id, payload);
  }

  @Post('projects/:projectId/documents')
  @ApiOperation({ summary: 'Create a document in a project' })
  @ApiParam({
    name: 'projectId',
    description: 'Project UUID',
    example: '7c2e6f35-2c0f-4f6f-8df5-6b8f0b8c6d12',
  })
  @ApiResponse({ status: 201, description: 'Document created successfully.' })
  @ApiResponse({ status: 400, description: 'Request body failed validation.' })
  @ApiResponse({
    status: 401,
    description: 'Access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not allowed to create documents.',
  })
  createDocument(
    @CurrentPayload() payload: PayloadType,
    @Param('projectId') projectId: string,
    @Body() dto: CreateDocumentDto,
  ) {
    return this.documentsService.createDocument(payload, projectId, dto);
  }

  @Put('documents/:id')
  @ApiOperation({ summary: 'Update a document' })
  @ApiParam({
    name: 'id',
    description: 'Document UUID',
    example: '9d3e7c14-0f66-4e1e-a01e-3d28e5d9a2b8',
  })
  @ApiResponse({ status: 200, description: 'Document updated successfully.' })
  @ApiResponse({ status: 400, description: 'Request body failed validation.' })
  @ApiResponse({
    status: 401,
    description: 'Access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not allowed to update this document.',
  })
  @ApiResponse({ status: 404, description: 'Document not found.' })
  updateDocument(
    @CurrentPayload() payload: PayloadType,
    @Param('id') id: string,
    @Body() dto: UpdateDocumentDto,
  ) {
    return this.documentsService.updateDocument(payload, id, dto);
  }

  @Delete('documents/:id')
  @ApiOperation({ summary: 'Delete a document' })
  @ApiParam({
    name: 'id',
    description: 'Document UUID',
    example: '9d3e7c14-0f66-4e1e-a01e-3d28e5d9a2b8',
  })
  @ApiResponse({ status: 200, description: 'Document deleted successfully.' })
  @ApiResponse({
    status: 401,
    description: 'Access token is invalid or expired.',
  })
  @ApiResponse({
    status: 403,
    description: 'User is not allowed to delete this document.',
  })
  @ApiResponse({ status: 404, description: 'Document not found.' })
  deleteDocument(
    @CurrentPayload() payload: PayloadType,
    @Param('id') id: string,
  ) {
    return this.documentsService.deleteDocument(payload, id);
  }
}
