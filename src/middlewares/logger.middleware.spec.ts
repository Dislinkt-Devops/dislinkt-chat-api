import { LoggerMiddleware } from './logger.middleware';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';

describe('LoggerMiddleware', () => {
  let middleware: LoggerMiddleware;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: jest.Mock;
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger();
    jest.spyOn(logger, 'log');
    middleware = new LoggerMiddleware();
    (middleware as any).logger = logger;

    req = { method: 'GET', originalUrl: '/test' };
    res = {};
    next = jest.fn();
  });

  it('should log the request method and URL', () => {
    middleware.use(req as Request, res as Response, next);
    expect(logger.log).toHaveBeenCalledWith('GET request to /test');
  });

  it('should call next()', () => {
    middleware.use(req as Request, res as Response, next);
    expect(next).toHaveBeenCalled();
  });
});