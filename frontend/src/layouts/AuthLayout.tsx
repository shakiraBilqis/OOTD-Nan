import { Outlet, Link } from 'react-router-dom';
import { Logo } from '@/components/ui';

/**
 * AuthLayout — split-screen layout for auth pages
 * Left: editorial/branding panel (hidden on mobile)
 * Right: form area
 */
export default function AuthLayout() {
  return (
    <div className="auth-layout">
      {/* ─── Left — Editorial Panel ─────────────────────────────── */}
      <div className="auth-panel auth-panel--left">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-16 w-64 h-64 rounded-full bg-ivory/20 blur-3xl" />
          <div className="absolute bottom-32 right-20 w-80 h-80 rounded-full bg-cognac/30 blur-3xl" />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full bg-burgundy/20 blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 max-w-md text-center px-8">
          <Logo size="lg" variant="light" className="mb-8 animate-in" />

          <p className="text-ivory/90 text-display-md font-heading italic animate-in-delay-1">
            Your Personal
            <br />
            AI Fashion Stylist
          </p>

          <p className="mt-6 text-ivory/50 text-body-md leading-relaxed animate-in-delay-2">
            Upload your wardrobe, get intelligent outfit recommendations,
            and experience virtual try-on — all in one beautiful app.
          </p>

          {/* Fashion quote */}
          <div className="mt-12 pt-8 border-t border-ivory/10 animate-in-delay-3">
            <blockquote className="text-ivory/40 text-body-sm italic font-heading">
              "Fashion is the armor to survive the reality of everyday life."
            </blockquote>
            <cite className="block mt-2 text-ivory/30 text-caption not-italic tracking-wider uppercase">
              — Bill Cunningham
            </cite>
          </div>

          {/* Floating fashion silhouettes */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-6 opacity-20">
            <div className="w-1 h-24 bg-ivory/40 rounded-full animate-pulse-soft" />
            <div className="w-1 h-32 bg-ivory/30 rounded-full animate-pulse-soft" style={{ animationDelay: '0.5s' }} />
            <div className="w-1 h-20 bg-ivory/50 rounded-full animate-pulse-soft" style={{ animationDelay: '1s' }} />
            <div className="w-1 h-28 bg-ivory/20 rounded-full animate-pulse-soft" style={{ animationDelay: '1.5s' }} />
          </div>
        </div>
      </div>

      {/* ─── Right — Form Panel ─────────────────────────────────── */}
      <div className="auth-panel auth-panel--right">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile logo */}
          <div className="lg:hidden mb-8 text-center">
            <Link to="/">
              <Logo size="md" variant="dark" />
            </Link>
          </div>

          {/* Page content (Login / Register / etc.) */}
          <Outlet />

          {/* Footer */}
          <p className="mt-12 text-center text-caption text-ink/30">
            © {new Date().getFullYear()} OOTD-Nan. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}
