import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/AuthContext';
import { loginSchema, type LoginInput } from '@/schemas/auth.schema';
import { Input, Button } from '@/components/ui';
import axios from 'axios';

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const expired = searchParams.get('expired') === '1';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginInput) => {
    setApiError(null);
    try {
      await login(data.email, data.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.error?.message || 'Login gagal. Silakan coba lagi.';
        setApiError(message);
      } else {
        setApiError('Terjadi kesalahan. Silakan coba lagi.');
      }
    }
  };

  return (
    <div className="animate-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-display-md font-heading font-bold text-ink text-balance">
          Welcome Back
        </h1>
        <p className="mt-2 text-body-md text-ink/50">
          Masuk ke akun OOTD-Nan Anda
        </p>
      </div>

      {/* Session expired alert */}
      {expired && (
        <div className="alert alert--info mb-6 animate-in-delay-1">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span>Sesi Anda telah berakhir. Silakan login kembali.</span>
        </div>
      )}

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
          <Input
            label="Password"
            type="password"
            placeholder="Masukkan password"
            autoComplete="current-password"
            error={errors.password?.message}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            }
            {...register('password')}
          />
        </div>

        {/* Forgot password link */}
        <div className="flex justify-end animate-in-delay-2">
          <Link
            to="/forgot-password"
            className="text-body-sm text-cognac hover:text-cognac-dark transition-colors font-medium"
          >
            Lupa password?
          </Link>
        </div>

        <div className="animate-in-delay-3">
          <Button
            type="submit"
            fullWidth
            size="lg"
            loading={isSubmitting}
          >
            Masuk
          </Button>
        </div>
      </form>

      {/* Register link */}
      <div className="mt-8 text-center animate-in-delay-4">
        <p className="text-body-sm text-ink/50">
          Belum punya akun?{' '}
          <Link
            to="/register"
            className="text-cognac hover:text-cognac-dark font-semibold transition-colors"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </div>
  );
}
