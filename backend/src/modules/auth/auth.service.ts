import argon2 from 'argon2';
import crypto from 'crypto';
import { nanoid } from 'nanoid';
import prisma from '../../config/database';
import { config } from '../../config';
import { createError } from '../../middleware/errorHandler';
import { sendPasswordResetEmail } from '../../services/email.service';
import type { RegisterInput, LoginInput } from './auth.schema';

// Argon2id configuration — OWASP recommended
const ARGON2_OPTIONS = {
  type: argon2.argon2id,
  memoryCost: 65536, // 64 MiB
  timeCost: 3,
  parallelism: 4,
};

const SESSION_DURATION_MS = config.session.maxAge;

export async function registerUser(input: RegisterInput, req: { ip?: string; headers: Record<string, unknown> }) {
  const existing = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true },
  });

  if (existing) {
    throw createError('Email is already registered', 409, 'EMAIL_TAKEN');
  }

  const passwordHash = await argon2.hash(input.password, ARGON2_OPTIONS);

  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        name: input.name,
        email: input.email,
        passwordHash,
      },
    });

    // Create default profile
    await tx.userProfile.create({
      data: {
        userId: newUser.id,
        displayName: input.name,
      },
    });

    // Record audit event
    await tx.auditEvent.create({
      data: {
        userId: newUser.id,
        eventType: 'register',
        ipAddress: req.ip,
        userAgent: String(req.headers['user-agent'] ?? ''),
      },
    });

    return newUser;
  });

  const token = await createSession(user.id, req);

  return {
    user: { id: user.id, name: user.name, email: user.email },
    token,
  };
}

export async function loginUser(input: LoginInput, req: { ip?: string; headers: Record<string, unknown> }) {
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: { id: true, name: true, email: true, passwordHash: true, role: true },
  });

  // Constant-time check to prevent timing attacks
  if (!user) {
    await argon2.hash('dummy_password_to_prevent_timing', ARGON2_OPTIONS);
    await prisma.auditEvent.create({
      data: {
        eventType: 'login_failed',
        ipAddress: req.ip,
        userAgent: String(req.headers['user-agent'] ?? ''),
        metadata: { reason: 'user_not_found' },
      },
    });
    throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const valid = await argon2.verify(user.passwordHash, input.password);

  if (!valid) {
    await prisma.auditEvent.create({
      data: {
        userId: user.id,
        eventType: 'login_failed',
        ipAddress: req.ip,
        userAgent: String(req.headers['user-agent'] ?? ''),
        metadata: { reason: 'wrong_password' },
      },
    });
    throw createError('Invalid email or password', 401, 'INVALID_CREDENTIALS');
  }

  const token = await createSession(user.id, req);

  await prisma.auditEvent.create({
    data: {
      userId: user.id,
      eventType: 'login_success',
      ipAddress: req.ip,
      userAgent: String(req.headers['user-agent'] ?? ''),
    },
  });

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token,
  };
}

export async function logoutUser(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { token } });
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerifiedAt: true,
      createdAt: true,
      profile: {
        select: {
          displayName: true,
          avatarPath: true,
          onboardingDone: true,
          onboardingStep: true,
          preferredLanguage: true,
          country: true,
          preferredUnit: true,
        },
      },
    },
  });

  if (!user) {
    throw createError('User not found', 404, 'USER_NOT_FOUND');
  }

  return user;
}

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true },
  });

  // Always return success to prevent email enumeration
  if (!user) return { message: 'If that email exists, a reset link has been sent' };

  // Delete any existing unused reset tokens for this user
  await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const resetUrl = `${config.frontendUrl}/reset-password?token=${rawToken}`;

  // Send real email via configured SMTP (Nodemailer)
  await sendPasswordResetEmail({
    to: email,
    name: user.name,
    resetUrl,
    token: rawToken,
  });

  return {
    message: 'If that email exists, a reset link has been sent',
    // In dev mode, return resetUrl to assist developers if SMTP is not yet filled
    ...(config.isDev ? { devResetUrl: resetUrl } : {}),
  };
}

export async function resetPassword(token: string, newPassword: string) {
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true } } },
  });

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    throw createError('Invalid or expired reset token', 400, 'INVALID_RESET_TOKEN');
  }

  const passwordHash = await argon2.hash(newPassword, ARGON2_OPTIONS);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: resetToken.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() },
    }),
    // Invalidate all existing sessions
    prisma.session.deleteMany({ where: { userId: resetToken.userId } }),
  ]);

  return { message: 'Password reset successful' };
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

async function createSession(
  userId: string,
  req: { ip?: string; headers: Record<string, unknown> }
): Promise<string> {
  const token = nanoid(48);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
      ipAddress: req.ip,
      userAgent: String(req.headers['user-agent'] ?? ''),
    },
  });

  return token;
}
