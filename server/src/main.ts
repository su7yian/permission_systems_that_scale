import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe — strips unknown fields, auto-transforms types
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Permission Systems That Scale API')
    .setDescription(
      'REST API for JWT authentication, role-based access control, projects, and documents. ' +
        'Authenticate with /auth/signin or /auth/signup, then use the returned access token as a Bearer token.',
    )
    .setVersion('1.0.0')
    .setContact('Permission Systems That Scale', '', '')
    .setLicense('UNLICENSED', '')
    .addServer('http://localhost:3000', 'Local development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Access token',
      },
      'access-token',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Refresh token',
      },
      'refresh-token',
    )
    .addTag(
      'Authentication',
      'Sign up, sign in, token rotation, and session invalidation',
    )
    .addTag('Projects', 'Project lifecycle and visibility operations')
    .addTag('Documents', 'Document lifecycle and project document operations')
    .addTag('User', 'Current user profile and password operations')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'Permission Systems That Scale API',
    jsonDocumentUrl: 'api-json',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
    },
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`🚀 Application running on http://localhost:${port}`);
}

bootstrap();
