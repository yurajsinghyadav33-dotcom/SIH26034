import { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@sih/shared';

export interface AppError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

/**
 * Centralized Enterprise Error Handler Middleware
 * Standardizes API error responses across the SIH26034 platform.
 */
export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode || 500;
  const errorCode = err.code || 'INTERNAL_SERVER_ERROR';

  // Protect sensitive system internals from leaking to client in production
  const isProd = process.env.NODE_ENV === 'production';
  const message = isProd && statusCode === 500
    ? 'An unexpected error occurred. Please contact the Legal Metrology Administrator.'
    : err.message || 'Unknown Server Error';

  const response: ApiResponse = {
    success: false,
    message,
    error: {
      code: errorCode,
      details: err.details,
    },
    timestamp: new Date().toISOString(),
  };

  res.status(statusCode).json(response);
}
