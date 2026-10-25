import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/schemas/auth.schema';
import { authService } from '@/services/auth.service';
import { Input, Button } from '@/components/ui';
import axios from 'axios';

export default function ForgotPasswordPage() {
  const [apiError, setApiError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setApiError(null);
    try {
      const res = await authService.forgotPassword(data.email);
      // If devResetUrl is returned by backend in dev mode
      const rawData = res.data as { devResetUrl?: string } | undefined;
      if (rawData?.devResetUrl) {
        setDevResetUrl(rawData.devResetUrl);
      }
      setSent(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.error?.message || 'Terjadi kesalahan. Silakan coba lagi.';
        setApiError(message);
      } else {
        setApiError('Terjadi kesalahan. Silakan coba lagi.');
      }
    }
  };

  if (sent) {
    return (
      <div className="animate-in text-center">
        {/* Success icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-forest/10 flex items-center justify-center mb-6">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-forest">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>

        <h1 className="text-display-md font-heading font-bold text-ink">
          Cek Email Anda
        </h1>
        <p className="mt-3 text-body-md text-ink/50 max-w-sm mx-auto">
          Jika email tersebut terdaftar, kami telah mengirimkan link untuk mereset password ke inbox email Anda.
        </p>

        {devResetUrl && (
          <div className="mt-6 mb-6 p-4 rounded-xl bg-cognac/10 border border-cognac/30 text-left text-body-sm">
            <p className="font-semibold text-cognac mb-1">🛠️ Shortcut Pengembang (Mode Development):</p>
            <p className="text-ink/70 mb-3 text-caption">Jika SMTP email belum aktif atau email belum sampai, Anda dapat langsung mereset password melalui tombol berikut:</p>
            <a href={devResetUrl} className="btn btn--secondary btn--sm inline-block">
              Buka Halaman Reset Password
            </a>
          </div>
        )}

        <div className="mt-8 space-y-3">
          <Link to="/login">
            <Button variant="primary" fullWidth>
              Kembali ke Login
            </Button>
          </Link>
          <button
            onClick={() => {
              setSent(false);
              setDevResetUrl(null);
            }}
            className="btn btn--ghost btn--full text-body-sm"
          >
            Coba email lain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display-md font-heading font-bold text-ink text-balance">
          Lupa Password?
        </h1>
        <p className="mt-2 text-body-md text-ink/50">
          Masukkan email Anda dan kami akan mengirimkan link untuk mereset password.
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
        <div className="animate-in-delay-1">
          <Input
            label="Email"
            type="email"
            placeholder="nama@email.com"
            autoComplete="email"
            error={errors.email?.message}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            }
            {...register('email')}
          />
        </div>

        <div className="animate-in-delay-2">
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isSubmitting}
          >
            Kirim Link Reset
          </Button>
        </div>
      </form>

      {/* Back to login */}
      <div className="mt-8 text-center animate-in-delay-3">
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
