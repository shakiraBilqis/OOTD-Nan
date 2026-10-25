import api from './api';
import type {
  AuthResponse,
  MeResponse,
  MessageResponse,
  RegisterFormData,
  LoginFormData,
} from '@/types';

// ─── Auth API Service ───────────────────────────────────────────────────────

export const authService = {
  /**
   * Register a new user account
   */
  async register(data: Omit<RegisterFormData, 'confirmPassword'>): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
    });
    return response.data;
  },

  /**
   * Login with email and password
   */
  async login(data: LoginFormData): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  /**
   * Logout current session
   */
  async logout(): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/logout');
    return response.data;
  },

  /**
   * Get current authenticated user
   */
  async me(): Promise<MeResponse> {
    const response = await api.get<MeResponse>('/auth/me');
    return response.data;
  },

  /**
   * Request a password reset email
   */
  async forgotPassword(email: string): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/forgot-password', { email });
    return response.data;
  },

  /**
   * Reset password with token
   */
  async resetPassword(token: string, password: string): Promise<MessageResponse> {
    const response = await api.post<MessageResponse>('/auth/reset-password', {
      token,
      password,
    });
    return response.data;
  },
};

export default authService;
