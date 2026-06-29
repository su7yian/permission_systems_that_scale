import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Module({
  controllers: [DocumentsController],
  // AuthGuard must be listed here so NestJS can inject PrismaService into it
  providers: [DocumentsService, AuthGuard],
})
export class DocumentsModule {}