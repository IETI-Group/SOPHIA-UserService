import type { NextFunction, Request, Response } from 'express';
import { logger } from '../utils/logger.js';

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log del error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
  });

  // Error de validación
  if (err.name === 'ValidationError') {
    const message = 'Validation Error';
    error = {
      name: 'ValidationError',
      message,
      statusCode: 400,
    } as CustomError;
  }

  // Error de duplicado
  if (err.name === 'MongoError' && (err as Error)) {
    const message = 'Duplicate field value entered';
    error = {
      name: 'DuplicateFieldError',
      message,
      statusCode: 400,
    } as CustomError;
  }

  // Error de cast (ID inválido)
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { name: 'CastError', message, statusCode: 404 } as CustomError;
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFound = (req: Request, _res: Response, next: NextFunction): void => {
  const error = new Error(`Not found - ${req.originalUrl}`) as CustomError;
  error.statusCode = 404;
  next(error);
};
