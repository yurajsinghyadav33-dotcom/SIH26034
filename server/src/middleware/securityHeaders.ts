import { Request, Response, NextFunction } from 'express';

/**
 * Enterprise & Government Grade Security Headers Middleware (OWASP Compliant)
 * Shields the Legal Metrology API against clickjacking, MIME-sniffing, XSS, and info leakage.
 */
export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME-sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Prevent Clickjacking
  res.setHeader('X-Frame-Options', 'DENY');

  // XSS Protection for older browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // HTTP Strict Transport Security (HSTS) - 1 Year
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy (Limit hardware access)
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(), geolocation=()');

  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; img-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com;"
  );

  // Remove server fingerprint
  res.removeHeader('X-Powered-By');

  next();
}
