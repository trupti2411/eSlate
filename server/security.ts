import type { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from './db';
import { auditLogs, loginAttempts } from '@shared/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000;

function getClientIp(req: Request): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.ip || 'unknown';
}

export async function checkLoginRateLimit(email: string, ip: string): Promise<{ allowed: boolean; remainingAttempts: number; lockoutUntil?: Date }> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);

  const recentAttempts = await db.select()
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.email, email.toLowerCase()),
        gte(loginAttempts.createdAt, windowStart),
        eq(loginAttempts.success, false)
      )
    );

  const failedCount = recentAttempts.length;

  if (failedCount >= MAX_LOGIN_ATTEMPTS) {
    const lastAttempt = recentAttempts.sort((a, b) =>
      (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)
    )[0];
    const lockoutEnd = new Date((lastAttempt?.createdAt?.getTime() || Date.now()) + LOCKOUT_DURATION_MS);

    if (lockoutEnd > new Date()) {
      return { allowed: false, remainingAttempts: 0, lockoutUntil: lockoutEnd };
    }
  }

  return { allowed: true, remainingAttempts: MAX_LOGIN_ATTEMPTS - failedCount };
}

export async function recordLoginAttempt(email: string, ip: string, success: boolean): Promise<void> {
  await db.insert(loginAttempts).values({
    email: email.toLowerCase(),
    ipAddress: ip,
    success,
  });

  if (success) {
    await logAudit({ action: 'login_success', resource: 'auth', details: { email }, ipAddress: ip });
  } else {
    await logAudit({ action: 'login_failed', resource: 'auth', details: { email }, ipAddress: ip, status: 'failure' });
  }
}

export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  const exemptPaths = [
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/verify',
    '/api/auth/logout',
    '/api/auth/forgot-password',
    '/api/auth/reset-password',
    '/api/contact',
  ];
  if (exemptPaths.some(p => req.path.startsWith(p))) {
    return next();
  }

  if (!req.path.startsWith('/api/')) {
    return next();
  }

  const tokenFromHeader = req.headers['x-csrf-token'] as string;
  const tokenFromSession = (req as any).session?.csrfToken;

  if (!tokenFromHeader || !tokenFromSession || tokenFromHeader !== tokenFromSession) {
    return res.status(403).json({ message: 'Invalid or missing CSRF token' });
  }

  next();
}

export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
  const isDev = process.env.NODE_ENV !== 'production';

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  if (!isDev) {
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  const scriptSrc = isDev
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://replit.com"
    : "script-src 'self' 'unsafe-inline' 'unsafe-eval'";

  const frameAncestors = isDev
    ? "frame-ancestors 'self' https://*.replit.dev https://*.replit.app https://*.picard.replit.dev https://replit.com"
    : "frame-ancestors 'none'";

  res.setHeader('Content-Security-Policy', [
    "default-src 'self'",
    scriptSrc,
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' ws: wss: https://storage.googleapis.com",
    "frame-src 'self' blob:",
    frameAncestors,
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '));

  next();
}

interface AuditLogEntry {
  userId?: string;
  action: string;
  resource?: string;
  resourceId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: any;
  status?: string;
}

export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    await db.insert(auditLogs).values({
      userId: entry.userId || null,
      action: entry.action,
      resource: entry.resource || null,
      resourceId: entry.resourceId || null,
      ipAddress: entry.ipAddress || null,
      userAgent: entry.userAgent || null,
      details: entry.details || null,
      status: entry.status || 'success',
    });
  } catch (error) {
    console.error('Failed to write audit log:', error);
  }
}

export function auditMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.path.startsWith('/api/') || req.method === 'GET') {
    return next();
  }

  const originalJson = res.json.bind(res);
  const startTime = Date.now();
  const ip = getClientIp(req);
  const userAgent = req.headers['user-agent'] || 'unknown';

  res.json = function (body: any) {
    const userId = (req as any).user?.id || (req as any).session?.userId;
    const status = res.statusCode >= 400 ? 'failure' : 'success';

    if (req.path !== '/api/auth/login') {
      logAudit({
        userId,
        action: `${req.method} ${req.path}`,
        resource: req.path.split('/')[2] || 'unknown',
        ipAddress: ip,
        userAgent,
        details: {
          statusCode: res.statusCode,
          duration: Date.now() - startTime,
        },
        status,
      });
    }

    return originalJson(body);
  };

  next();
}

export function getCsrfTokenEndpoint(req: Request, res: Response): void {
  let token = (req as any).session?.csrfToken;
  if (!token) {
    token = generateCsrfToken();
    (req as any).session.csrfToken = token;
  }
  res.json({ csrfToken: token });
}
