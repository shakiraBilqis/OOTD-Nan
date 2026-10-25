// ─── Auth Types ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role?: string;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  profile?: UserProfile | null;
}

export interface UserProfile {
  displayName: string;
  avatarPath: string | null;
  onboardingDone: boolean;
  onboardingStep: number;
  preferredLanguage: string;
  country: string | null;
  preferredUnit: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: User;
}

export interface MessageResponse {
  success: boolean;
  data: {
    message: string;
  };
}

// ─── API Error ──────────────────────────────────────────────────────────────

export interface ApiError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}

// ─── Form Inputs ────────────────────────────────────────────────────────────

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface ForgotPasswordFormData {
  email: string;
}

export interface ResetPasswordFormData {
  token: string;
  password: string;
  confirmPassword: string;
}
