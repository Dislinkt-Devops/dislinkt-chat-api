import { HttpStatus, HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';
import { AllExceptionFilter } from './exception.filter';

describe('AllExceptionFilter', () => {
    let filter: ExceptionFilter;
    let configService: ConfigService;
    let host: ArgumentsHost;
    let request: Request;
    let response: Response;
    let logger: Logger;
  
    beforeEach(() => {
      configService = new ConfigService({
        RETURN_SERVER_ERRORS: 'true',
        LOG_ALL_EXCEPTIONS: 'true',
      });
      filter = new AllExceptionFilter(configService);
      response = {
          status: jest.fn().mockReturnValue({
              json: jest.fn(),
          }),
      } as unknown as Response;
      request = {
        url: 'http://localhost:3000/test',
      } as Request;
      host = {
          switchToHttp: jest.fn(() => {
              return {
                  getResponse: jest.fn().mockReturnValue(response),
                  getRequest: jest.fn().mockReturnValue(request),
              };
          }),
      } as unknown as ArgumentsHost;
      logger = new Logger();
      jest.spyOn(logger, 'error');
      (filter as any).logger = logger;
    });
  
    it('should return error message with status code', () => {
      const exception = new HttpException('Test', HttpStatus.FORBIDDEN);
      filter.catch(exception, host);
      expect(response.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(response.status(HttpStatus.FORBIDDEN).json).toHaveBeenCalledWith({
        statusCode: HttpStatus.FORBIDDEN,
        timestamp: expect.any(String),
        path: 'http://localhost:3000/test',
        error: 'HttpException',
        errorMessage: 'Test',
      });
    });
  
    it('should log the exception if logExceptions is true', () => {
      const exception = new Error('Test');
      filter.catch(exception, host);
      expect(logger.error).toHaveBeenCalledWith(exception);
    });
  });