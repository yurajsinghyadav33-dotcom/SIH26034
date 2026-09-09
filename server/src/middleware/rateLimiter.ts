import { Request, Response, NextFunction } from 'express';
import type { ApiResponse } from '@sih/shared';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

/**
 * In-Memory Sliding Window Rate Limiter
 * Guards heavy compute endpoints (e.g. OCR and AI parsing) against DoS and compute exhaustion.
 */
export function createRateLimiter(options: {
  windowMs: number;
  maxRequests: number;
  message?: string;
}) {
  const ipStore = new Map<string, RateLimitRecord>();

  // Periodically clean up expired entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of ipStore.entries()) {
      if (now > record.resetTime) {
        ipStore.delete(ip);
      }
    }
  }, 5 * 60 * 1000).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    // In test environment, skip or allow high burst unless testing rate limiter explicitly
    if (process.env.NODE_ENV === 'test' && !req.headers['x-test-rate-limit']) {
      return next();
    }

    const ip =
      (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      'unknown-client';

    const now = Date.now();
    let record = ipStore.get(ip);

    if (!record || now > record.resetTime) {
      record = {
        count: 1,
        resetTime: now + options.windowMs,
      };
      ipStore.set(ip, record);
    } else {
      record.count += 1;
    }

    const remaining = Math.max(0, options.maxRequests - record.count);
    const resetSeconds = Math.ceil((record.resetTime - now) / 1000);

    res.setHeader('X-RateLimit-Limit', options.maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', resetSeconds);

    if (record.count > options.maxRequests) {
      res.setHeader('Retry-After', resetSeconds);
      const rateLimitResponse: ApiResponse = {
        success: false,
        message:
          options.message ||
          'Too many requests to Legal Metrology compliance service. Please retry in a moment.',
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          details: { retryAfterSeconds: resetSeconds },
        },
        timestamp: new Date().toISOString(),
      };
      res.status(429).json(rateLimitResponse);
      return;
    }

    next();
  };
}
