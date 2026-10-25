import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/features/auth/AuthContext';
import { registerSchema, type RegisterInput } from '@/schemas/auth.schema';
import { Input, Button } from '@/components/ui';
import axios from 'axios';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterInput) => {
    setApiError(null);
    try {
      await registerUser(data.name, data.email, data.password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const code = err.response?.data?.error?.code;
        if (code === 'EMAIL_TAKEN') {
          setApiError('Email ini sudah terdaftar. Silakan login atau gunakan email lain.');
        } else {
          const message = err.response?.data?.error?.message || 'Registrasi gagal. Silakan coba lagi.';
          setApiError(message);
        }
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
          Buat Akun Baru
        </h1>
        <p className="mt-2 text-body-md text-ink/50">
          Bergabung dengan OOTD-Nan dan temukan gaya terbaik Anda
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
            label="Nama Lengkap"
            type="text"
            placeholder="Masukkan nama Anda"
            autoComplete="name"
            error={errors.name?.message}
            icon={
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            }
            {...register('name')}
          />
        </div>

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
            label="Konfirmasi Password"
            type="password"
            placeholder="Ulangi password"
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
            Buat Akun
          </Button>
        </div>
      </form>

      {/* Terms */}
      <p className="mt-4 text-caption text-ink/30 text-center animate-in-delay-3">
        Dengan mendaftar, Anda menyetujui{' '}
        <a href="#" className="text-cognac hover:underline">Syarat & Ketentuan</a>
        {' '}dan{' '}
        <a href="#" className="text-cognac hover:underline">Kebijakan Privasi</a>
      </p>

      {/* Login link */}
      <div className="mt-8 text-center animate-in-delay-4">
        <p className="text-body-sm text-ink/50">
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="text-cognac hover:text-cognac-dark font-semibold transition-colors"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </div>
  );
}
