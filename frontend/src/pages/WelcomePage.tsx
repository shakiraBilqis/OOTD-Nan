import React from 'react';
import { Link } from 'react-router-dom';

export default function WelcomePage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#141210] flex items-center justify-center">
      {/* Background Hero Image (Photo 1) */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/backgrounds/welcome-hero.jpg"
          alt="Fashion Wardrobe Background"
          className="w-full h-full object-cover object-top filter brightness-[0.92] contrast-[1.05]"
        />
        {/* Silhouette Gradient Overlay matching Photo 2 */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(22, 20, 18, 0.65) 0%, rgba(22, 20, 18, 0.35) 25%, rgba(18, 16, 14, 0.70) 55%, rgba(14, 13, 11, 0.94) 80%, rgba(10, 9, 8, 0.98) 100%)',
          }}
        />
        {/* Subtle vignette border */}
        <div className="absolute inset-0 bg-radial-vignette opacity-40 pointer-events-none" />
      </div>

      {/* Main Content Container (Mobile-first luxury layout, responsive up to desktop) */}
      <div className="relative z-10 w-full max-w-md min-h-screen flex flex-col justify-between px-6 py-8 md:py-10 mx-auto">
        {/* Top Header Section */}
        <header className="pt-2 animate-in text-center flex flex-col items-center">
          {/* Subtle Top Pill Indicator */}
          <div className="w-11 h-1.5 bg-white/25 rounded-full mb-6" />

          {/* OOTD-Nan Studio Curated Brand */}
          <h2 className="text-white font-heading text-2xl md:text-3xl tracking-[0.20em] font-medium uppercase drop-shadow-sm">
            OOTD-NAN
          </h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="w-6 md:w-8 h-[1px] bg-white/35" />
            <span className="text-[10px] md:text-[11px] tracking-[0.25em] text-white/70 uppercase font-sans font-medium">
              STUDIO CURATED
            </span>
            <span className="w-6 md:w-8 h-[1px] bg-white/35" />
          </div>
        </header>

        {/* Bottom Hero & Actions Section */}
        <div className="pb-4 md:pb-6 animate-in-delay-1">
          {/* Eyebrow */}
          <p className="text-[#c07848] text-[11px] md:text-[12px] font-bold tracking-[0.24em] uppercase mb-3">
            THE BESPOKE WARDROBE
          </p>

          {/* Main Editorial Headline */}
          <h1 className="text-white font-heading text-[32px] sm:text-[38px] md:text-[42px] font-normal leading-[1.12] tracking-tight mb-3 text-balance">
            Your wardrobe.<br />
            Your colors.<br />
            <span className="italic font-serif font-light text-[#f0e6dc]">
              Your kind of style.
            </span>
          </h1>

          {/* Subtitle Description */}
          <p className="text-white/75 text-[14px] md:text-[15px] font-light leading-relaxed max-w-sm mb-8">
            Discover combinations you already own. See your next look before you wear it.
          </p>

          {/* Action CTA Buttons */}
          <div className="space-y-3.5">
            {/* Primary Action Button: GET STARTED */}
            <Link
              to="/register"
              className="w-full bg-[#f8f5ef] hover:bg-white text-[#181614] font-semibold tracking-[0.14em] text-[12px] md:text-[13px] uppercase py-3.5 pl-7 pr-3 rounded-full flex items-center justify-between transition-all duration-300 shadow-xl group cursor-pointer"
            >
              <span>GET STARTED</span>
              <div className="w-9 h-9 rounded-full bg-[#181614] text-white flex items-center justify-center transition-transform duration-300 group-hover:translate-x-1">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </div>
            </Link>

            {/* Secondary Action Button: I ALREADY HAVE AN ACCOUNT */}
            <Link
              to="/login"
              className="w-full bg-[#272522]/90 hover:bg-[#33302b] text-white/90 hover:text-white font-semibold tracking-[0.14em] text-[12px] md:text-[13px] uppercase py-4 px-6 rounded-2xl text-center transition-all duration-300 border border-white/10 block cursor-pointer"
            >
              I ALREADY HAVE AN ACCOUNT
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
