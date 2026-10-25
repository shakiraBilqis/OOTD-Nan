import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, ProtectedRoute, GuestRoute } from '@/features/auth';
import AuthLayout from '@/layouts/AuthLayout';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import DashboardPage from '@/pages/DashboardPage';
import WelcomePage from '@/pages/WelcomePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* ─── Guest routes (auth pages) ────────────────────── */}
            <Route
              element={
                <GuestRoute>
                  <AuthLayout />
                </GuestRoute>
              }
            >
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
            </Route>

            {/* ─── Protected routes ─────────────────────────────── */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              }
            />

            {/* ─── Welcome / Landing page (First page shown) ───── */}
            <Route
              path="/"
              element={
                <GuestRoute>
                  <WelcomePage />
                </GuestRoute>
              }
            />
            <Route path="/welcome" element={<WelcomePage />} />

            {/* ─── 404 ──────────────────────────────────────────── */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center bg-ivory">
                  <div className="text-center animate-in">
                    <h1 className="text-display-xl font-heading font-bold text-ink/10">404</h1>
                    <p className="mt-4 text-body-lg text-ink/50">Halaman tidak ditemukan</p>
                    <a href="/login" className="mt-6 inline-block btn btn--primary">
                      Kembali ke Home
                    </a>
                  </div>
                </div>
              }
            />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
