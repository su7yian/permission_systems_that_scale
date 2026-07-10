import { Module } from '@nestjs/common';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { JwtAccessGuard } from '../auth/guards/jwt.guard';

@Module({
  controllers: [DocumentsController],
  // JwtAccessGuard must be listed here so NestJS can inject PrismaService into it
  providers: [DocumentsService, JwtAccessGuard],
})
export class DocumentsModule {}