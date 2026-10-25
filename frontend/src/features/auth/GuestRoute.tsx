import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/features/auth/AuthContext';

interface GuestRouteProps {
  children: React.ReactNode;
}

/**
 * Wraps routes that should only be accessible to non-authenticated users.
 * Redirects to /dashboard if already logged in.
 */
export default function GuestRoute({ children }: GuestRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory">
        <div className="text-center space-y-4 animate-in">
          <div className="spinner w-8 h-8 text-cognac mx-auto" />
          <p className="text-body-sm text-ink/40">Memuat...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    const from = (location.state as { from?: string })?.from || '/dashboard';
    return <Navigate to={from} replace />;
  }

  return <>{children}</>;
}
