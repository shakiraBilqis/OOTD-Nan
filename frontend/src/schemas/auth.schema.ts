import { z } from 'zod';

// ─── Shared password rules ─────────────────────────────────────────────────
const passwordField = z
  .string()
  .min(8, 'Password minimal 8 karakter')
  .max(128, 'Password maksimal 128 karakter')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password harus mengandung huruf besar, huruf kecil, dan angka'
  );

// ─── Register Schema ────────────────────────────────────────────────────────
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Nama minimal 2 karakter')
      .max(100, 'Nama maksimal 100 karakter'),
    email: z
      .string()
      .email('Format email tidak valid')
      .toLowerCase(),
    password: passwordField,
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

// ─── Login Schema ───────────────────────────────────────────────────────────
export const loginSchema = z.object({
  email: z
    .string()
    .email('Format email tidak valid')
    .toLowerCase(),
  password: z.string().min(1, 'Password wajib diisi'),
});

// ─── Forgot Password Schema ────────────────────────────────────────────────
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .email('Format email tidak valid')
    .toLowerCase(),
});

// ─── Reset Password Schema ─────────────────────────────────────────────────
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token wajib diisi'),
    password: passwordField,
    confirmPassword: z.string().min(1, 'Konfirmasi password wajib diisi'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password tidak cocok',
    path: ['confirmPassword'],
  });

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
