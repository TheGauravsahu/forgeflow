import { Request, Response, NextFunction } from 'express';
import { verifyToken, UserSessionPayload } from '../auth';

export interface AuthenticatedRequest extends Request {
  user?: UserSessionPayload;
}

// Authentication Middleware: requires a valid Bearer token
export function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = verifyToken(token);
    if (session) {
      req.user = session;
      return next();
    }
  }
  return res.status(401).json({ error: 'Unauthorized. Valid token required.' });
}

// Optional Authentication Middleware: parses Bearer token if present
export function optionalAuthenticate(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = verifyToken(token);
    if (session) {
      req.user = session;
    }
  }
  next();
}

// Simple in-memory rate limiting cache
const rateLimitCache = new Map<string, { count: number; resetAt: number }>();

// Rate Limiting Middleware
export function rateLimit(limitCount: number, windowMs: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Get IP address
    const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
    // Unique key per IP and URL path
    const key = `${ip}:${req.baseUrl || req.path}`;
    const now = Date.now();
    const record = rateLimitCache.get(key);

    if (record) {
      if (now < record.resetAt) {
        if (record.count >= limitCount) {
          return res.status(429).json({ error: 'Too many requests. Please try again later.' });
        }
        record.count += 1;
      } else {
        rateLimitCache.set(key, { count: 1, resetAt: now + windowMs });
      }
    } else {
      rateLimitCache.set(key, { count: 1, resetAt: now + windowMs });
    }
    next();
  };
}

// Security Headers Middleware
export function securityHeaders(req: Request, res: Response, next: NextFunction) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
}
