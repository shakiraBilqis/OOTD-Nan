import { Request, Response, NextFunction } from 'express';
import { Session } from '@prisma/client';
import prisma from '../config/database';

// Extend Express Request to include session user
declare global {
  namespace Express {
    interface Request {
      sessionData?: Session & { userId: string };
      currentUserId?: string;
    }
  }
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);

    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
      return;
    }

    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: { select: { id: true, role: true, email: true } } },
    });

    if (!session) {
      res.status(401).json({
        success: false,
        error: { code: 'INVALID_TOKEN', message: 'Invalid or expired session' },
      });
      return;
    }

    if (session.expiresAt < new Date()) {
      // Cleanup expired session
      await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
      res.status(401).json({
        success: false,
        error: { code: 'SESSION_EXPIRED', message: 'Session has expired, please login again' },
      });
      return;
    }

    req.sessionData = session;
    req.currentUserId = session.userId;
    next();
  } catch (error) {
    next(error);
  }
}

export function optionalAuthenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  const token = extractToken(req);
  if (!token) {
    next();
    return;
  }
  authenticate(req, _res, next);
}

function extractToken(req: Request): string | null {
  // Bearer token from Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Cookie-based token
  const cookieToken = req.cookies?.['closette_session'];
  if (cookieToken) return cookieToken;

  return null;
}
