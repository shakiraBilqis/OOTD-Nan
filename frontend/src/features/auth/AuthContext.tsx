import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types';
import { authService } from '@/services/auth.service';

// ─── Auth Context Types ─────────────────────────────────────────────────────

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ─── Storage helpers ────────────────────────────────────────────────────────

const TOKEN_KEY = 'sintren_token';
const USER_KEY = 'sintren_user';

function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || localStorage.getItem('closette_token');
}

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_KEY) || localStorage.getItem('closette_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function storeAuth(token: string, user: User) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem('closette_token');
  localStorage.removeItem('closette_user');
}

// ─── Provider ───────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: getStoredUser(),
    token: getStoredToken(),
    isAuthenticated: !!getStoredToken(),
    isLoading: true,
  });

  // Verify session on mount
  useEffect(() => {
    const verify = async () => {
      const token = getStoredToken();
      if (!token) {
        setState((s) => ({ ...s, isLoading: false }));
        return;
      }

      try {
        const res = await authService.me();
        setState({
          user: res.data,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
        // Update stored user with fresh data
        localStorage.setItem(USER_KEY, JSON.stringify(res.data));
      } catch {
        clearAuth();
        setState({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    verify();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await authService.login({ email, password });
    const { user, token } = res.data;
    storeAuth(token, user);
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const res = await authService.register({ name, email, password });
    const { user, token } = res.data;
    storeAuth(token, user);
    setState({
      user,
      token,
      isAuthenticated: true,
      isLoading: false,
    });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Even if API fails, clear local state
    }
    clearAuth();
    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const res = await authService.me();
      setState((s) => ({ ...s, user: res.data }));
      localStorage.setItem(USER_KEY, JSON.stringify(res.data));
    } catch {
      // Silently fail
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
