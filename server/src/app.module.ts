import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { DocumentsModule } from './documents/documents.module';
import { RedisModule } from './redis/redis.module';
import { JtiModule } from './auth/jti/jti.module';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';


@Module({
  imports: [
    PrismaModule,
    AuthModule,
    ProjectsModule,
    DocumentsModule,
    RedisModule,
    JtiModule,
    ConfigModule.forRoot({
      isGlobal: true, 
    }),
    UserModule,
  ],
})
export class AppModule {}


  

