import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

@Catch()
export class AllExceptionFilter implements ExceptionFilter {
  private readonly returnServerErrors: boolean = false;
  private readonly logExceptions: boolean = true;
  private readonly logger = new Logger(AllExceptionFilter.name);

  constructor(configService: ConfigService) {
    this.returnServerErrors =
      configService.get('RETURN_SERVER_ERRORS') === 'true';
    this.logExceptions = configService.get('LOG_ALL_EXCEPTIONS') === 'true';
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<Request>();

    let errorMessage: string;
    let status: HttpStatus;
    let error: string;

    if (this.logExceptions) this.logger.error(exception);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      error = (errorResponse as Error).name || exception.name;
      errorMessage = (errorResponse as Error).message || exception.message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      error = this.returnServerErrors
        ? (exception as Error).name
        : 'Internal server error';
      errorMessage = this.returnServerErrors
        ? (exception as Error).message
        : 'Internal server error';
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      error: error,
      errorMessage: errorMessage,
    });
  }
}
