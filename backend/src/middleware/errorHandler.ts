import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  isOperational?: boolean;
}

export function createError(
  message: string,
  statusCode: number,
  code?: string
): AppError {
  const err = new Error(message) as AppError;
  err.statusCode = statusCode;
  err.code = code;
  err.isOperational = true;
  return err;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500;
  const code = err.code ?? 'INTERNAL_ERROR';

  // Never expose internal details to client
  const message =
    err.isOperational || config.isDev
      ? err.message
      : 'An unexpected error occurred';

  if (!err.isOperational) {
    // Log only non-operational (unexpected) errors with full context
    // Do NOT log passwords, tokens, or user photo content
    console.error('[UnhandledError]', {
      code,
      statusCode,
      stack: config.isDev ? err.stack : undefined,
    });
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      ...(config.isDev && !err.isOperational ? { stack: err.stack } : {}),
    },
  });
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.path} not found`,
    },
  });
}
