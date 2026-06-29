import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthorizationError } from '../errors/authorization.error';

@Catch(AuthorizationError)
export class AuthorizationExceptionFilter implements ExceptionFilter {
  catch(exception: AuthorizationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.FORBIDDEN).json({
      statusCode: 403,
      error: 'Forbidden',
      message: exception.message,
    });
  }
}