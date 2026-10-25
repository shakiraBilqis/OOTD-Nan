import { Router, Request, Response, NextFunction } from 'express';
import { validate } from '../../middleware/validate';
import { authenticate } from '../../middleware/authenticate';
import { authRateLimit } from '../../middleware/rateLimit';
import {
  registerSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from './auth.schema';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  requestPasswordReset,
  resetPassword,
} from './auth.service';

const router = Router();

// POST /api/v1/auth/register
router.post(
  '/register',
  authRateLimit,
  validate(registerSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await registerUser(req.body, {
        ip: req.ip,
        headers: req.headers as Record<string, unknown>,
      });

      res.status(201).json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/auth/login
router.post(
  '/login',
  authRateLimit,
  validate(loginSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await loginUser(req.body, {
        ip: req.ip,
        headers: req.headers as Record<string, unknown>,
      });

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/auth/logout
router.post('/logout', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.substring(7) ?? '';
    await logoutUser(token);
    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/auth/me
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getCurrentUser(req.currentUserId!);
    res.json({ success: true, data: user });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/auth/forgot-password
router.post(
  '/forgot-password',
  authRateLimit,
  validate(forgotPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await requestPasswordReset(req.body.email);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/v1/auth/reset-password
router.post(
  '/reset-password',
  authRateLimit,
  validate(resetPasswordSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await resetPassword(req.body.token, req.body.password);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
