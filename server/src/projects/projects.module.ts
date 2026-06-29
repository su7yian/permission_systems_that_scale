import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { AuthGuard } from '../common/guards/auth.guard';

@Module({
  controllers: [ProjectsController],
  // AuthGuard must be listed here so NestJS can inject PrismaService into it
  providers: [ProjectsService, AuthGuard],
})
export class ProjectsModule {}