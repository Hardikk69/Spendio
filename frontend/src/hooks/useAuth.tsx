import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { api } from '../lib/api';
import {
  User,
  getToken,
  getUser,
  setToken,
  setUser,
  clearAuth,
} from '../lib/auth';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export interface RegisterPayload {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  role?: 'user' | 'enterprise' | 'admin';
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(getUser());
  const [isLoading, setIsLoading] = useState<boolean>(!!getToken() && !getUser());
  const [error, setError] = useState<string | null>(null);

  // On mount: if there's a token but no cached user, fetch /me
  useEffect(() => {
    const token = getToken();
    if (token && !getUser()) {
      setIsLoading(true);
      api
        .get<{ user: User }>('/api/auth/me')
        .then((res) => {
          setUser(res.user);
          setUserState(res.user);
        })
        .catch(() => {
          clearAuth();
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const res = await api.post<{ access_token: string; user: User }>(
      '/api/auth/login',
      { email, password }
    );
    setToken(res.access_token);
    setUser(res.user);
    setUserState(res.user);
  }, []);

  const register = useCallback(async (data: RegisterPayload) => {
    setError(null);
    const res = await api.post<{ access_token: string; user: User }>(
      '/api/auth/register',
      data
    );
    setToken(res.access_token);
    setUser(res.user);
    setUserState(res.user);
  }, []);

  const logout = useCallback(() => {
    clearAuth();
    setUserState(null);
    window.location.href = '/login';
  }, []);

  const refreshUser = useCallback(async () => {
    const res = await api.get<{ user: User }>('/api/auth/me');
    setUser(res.user);
    setUserState(res.user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        error,
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

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within <AuthProvider>');
  return ctx;
}
