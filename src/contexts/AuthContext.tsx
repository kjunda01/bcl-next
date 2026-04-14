"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

const AUTH_USER_KEY = 'app.auth.user';
const AUTH_KEEP_LOGGED_KEY = 'app.auth.keepLoggedIn';

export type ProfileType = 'aluno' | 'musico' | 'maestro' | 'admin' | 'public';

export interface User {
  id: string;
  name: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  address?: string;
  birthDate?: string;
  pictureUrl?: string;
  profileType?: ProfileType;
}

const MOCK_USER: User = {
  id: 'mock-1',
  name: 'João das Couves',
  firstName: 'João',
  lastName: 'das Couves',
  email: 'joao.das.couves@example.com',
  phone: '(35) 98765-4321',
  address: 'Rua das Flores, 123, Luminárias - MG',
  birthDate: '1990-05-15',
  profileType: 'musico',
};

type AuthContextValue = {
  user: User | null;
  isLoggedIn: boolean;
  displayName: string | null;
  login: (user: string, keepLoggedIn: boolean) => Promise<void>;
  loginWithGoogle: (keepLoggedIn: boolean) => void;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<User>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function restoreUser(): User | null {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return null;
  }

  const keep = localStorage.getItem(AUTH_KEEP_LOGGED_KEY) === 'true';
  if (!keep) return null;
  const stored = localStorage.getItem(AUTH_USER_KEY);
  if (!stored) return null;
  try {
    return JSON.parse(stored) as User;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => restoreUser());

  const login = useCallback(async (user: string, keepLoggedIn: boolean) => {
    setUser({ ...MOCK_USER });
    if (keepLoggedIn) {
      localStorage.setItem(AUTH_KEEP_LOGGED_KEY, 'true');
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(MOCK_USER));
    } else {
      localStorage.removeItem(AUTH_KEEP_LOGGED_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  }, []);

  const loginWithGoogle = useCallback(
    (keepLoggedIn: boolean) => login('google', keepLoggedIn),
    [login],
  );

  const logout = useCallback(async () => {
    setUser(null);
    localStorage.removeItem(AUTH_KEEP_LOGGED_KEY);
    localStorage.removeItem(AUTH_USER_KEY);
  }, []);

  const updateProfile = useCallback((patch: Partial<User>) => {
    setUser((prev) => {
      const next = { ...(prev ?? MOCK_USER), ...patch };
      if (localStorage.getItem(AUTH_KEEP_LOGGED_KEY) === 'true') {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoggedIn: user !== null,
      displayName: user ? user.firstName || user.name : null,
      login,
      loginWithGoogle,
      logout,
      updateProfile,
    }),
    [user, login, loginWithGoogle, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
