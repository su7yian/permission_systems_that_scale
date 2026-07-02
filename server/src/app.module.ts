import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { DocumentsModule } from './documents/documents.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    PrismaModule,   
    AuthModule,
    ProjectsModule,
    DocumentsModule,
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
  ],
})
export class AppModule {}


  

