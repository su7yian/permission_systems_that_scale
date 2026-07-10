import { Module } from '@nestjs/common';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { JwtAccessGuard } from '../auth/guards/jwt.guard';

@Module({
  controllers: [ProjectsController],
  providers: [ProjectsService, JwtAccessGuard],
})
export class ProjectsModule {}