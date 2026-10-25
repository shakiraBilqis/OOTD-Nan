import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordInput } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { Input, Button } from '@/components/ui';
import axios from 'axios';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token: tokenFromUrl, password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setApiError(null);
    try {
      await authService.resetPassword(data.token, data.password);
      setSuccess(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const code = err.response?.data?.error?.code;
        if (code === 'INVALID_RESET_TOKEN') {
          setApiError('Token reset tidak valid atau sudah kedaluwarsa. Silakan request ulang.');
        } else {
          const message = err.response?.data?.error?.message || 'Reset password gagal. Silakan coba lagi.';
          setApiError(message);
        }
      } else {
        setApiError('Terjadi kesalahan. Silakan coba lagi.');
      }
    }
  };

  if (success) {
    return (
      <div className="animate-in text-center">
        {/* Success icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-forest">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>

        <h1 className="text-display-md font-heading font-bold text-ink">
          Password Berhasil Direset!
        </h1>
        <p className="mt-3 text-body-md text-ink/50">
          Password Anda telah berhasil diubah. Silakan login dengan password baru.
        </p>

        <div className="mt-8">
          <Link to="/login">
            <Button variant="primary" fullWidth size="lg">
              Masuk Sekarang
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display-md font-heading font-bold text-ink text-balance">
          Reset Password
        </h1>
        <p className="mt-2 text-body-md text-ink/50">
          Buat password baru untuk akun Anda
        </p>
      </div>

      {/* API Error */}
      {apiError && (
        <div className="alert alert--error mb-6 animate-in" role="alert">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          <span>{apiError}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {/* Hidden token field — auto-filled from URL */}
        {!tokenFromUrl && (
          <div className="animate-in-delay-1">
            <Input
              label="Token Reset"
              type="text"
              placeholder="Paste token dari email"
              error={errors.token?.message}
              {...register('token')}
            />
          </div>
        )}

        <div className="animate-in-delay-1">
          <Input
            label="Password Baru"
            type="password"
            placeholder="Minimal 8 karakter"
            autoComplete="new-password"
            error={errors.password?.message}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
            {...register('password')}
          />
          {!errors.password && (
            <p className="mt-1.5 text-caption text-ink/30">
              Harus mengandung huruf besar, huruf kecil, dan angka
            </p>
          )}
        </div>

        <div className="animate-in-delay-2">
          <Input
            label="Konfirmasi Password Baru"
            type="password"
            placeholder="Ulangi password baru"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
              </svg>
            }
            {...register('confirmPassword')}
          />
        </div>

        <div className="animate-in-delay-3 pt-1">
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isSubmitting}
          >
            Reset Password
          </Button>
        </div>
      </form>

      {/* Back to login */}
      <div className="mt-8 text-center animate-in-delay-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-body-sm text-ink/50 hover:text-ink transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Kembali ke halaman login
        </Link>
      </div>
    </div>
  );
}
