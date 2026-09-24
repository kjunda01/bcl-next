"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { demoUserByRole, findDemoUser } from '@/core/auth/demoUsers';
import {
  AUTHENTICATED_ROLES,
  PUBLIC_ROLES,
  type AccessRoles,
  type AuthenticatedRole,
} from '@/core/auth/roles';
import type { AppUser } from '@/domains/users/types';

const AUTH_USER_KEY = 'app.auth.user';
const AUTH_KEEP_LOGGED_KEY = 'app.auth.keepLoggedIn';

export type SessionUser = AppUser;

type AuthContextValue = {
  user: SessionUser | null;
  isHydrated: boolean;
  isLoggedIn: boolean;
  roles: AccessRoles;
  displayName: string | null;
  login: (email: string, password: string, keepLoggedIn: boolean) => Promise<void>;
  loginAs: (role: AuthenticatedRole, keepLoggedIn: boolean) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (patch: Partial<SessionUser>) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const subscribeToHydration = () => () => undefined;

function persist(user: SessionUser | null, keepLoggedIn: boolean) {
  if (typeof window === 'undefined') return;
  if (user && keepLoggedIn) {
    localStorage.setItem(AUTH_KEEP_LOGGED_KEY, 'true');
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return;
  }
  localStorage.removeItem(AUTH_KEEP_LOGGED_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

function restoreUser(): SessionUser | null {
  if (typeof window === 'undefined') return null;
  const keep = localStorage.getItem(AUTH_KEEP_LOGGED_KEY) === 'true';
  if (!keep) return null;
  const stored = localStorage.getItem(AUTH_USER_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as Partial<SessionUser>;
    const roles = Array.isArray(parsed.roles)
      ? parsed.roles.filter((role): role is AuthenticatedRole =>
          (AUTHENTICATED_ROLES as readonly string[]).includes(role),
        )
      : [];
    if (roles.length === 0) return null;
    return { ...parsed, roles } as SessionUser;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(() => restoreUser());
  const isHydrated = useSyncExternalStore(
    subscribeToHydration,
    () => true,
    () => false,
  );

  const login = useCallback(async (email: string, password: string, keepLoggedIn: boolean) => {
    const found = findDemoUser(email, password);
    if (!found) {
      throw new Error('E-mail ou senha inválidos.');
    }
    setUser(found);
    persist(found, keepLoggedIn);
  }, []);

  const loginAs = useCallback(async (role: AuthenticatedRole, keepLoggedIn: boolean) => {
    const found = demoUserByRole(role);
    setUser(found);
    persist(found, keepLoggedIn);
  }, []);

  const logout = useCallback(async () => {
    setUser(null);
    persist(null, false);
  }, []);

  const updateProfile = useCallback((patch: Partial<SessionUser>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch, updatedAt: new Date().toISOString() };
      if (localStorage.getItem(AUTH_KEEP_LOGGED_KEY) === 'true') {
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(next));
      }
      return next;
    });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => {
      const hydratedUser = isHydrated ? user : null;
      return {
        user: hydratedUser,
        isHydrated,
        isLoggedIn: hydratedUser !== null,
        roles: hydratedUser?.roles ?? PUBLIC_ROLES,
        displayName: hydratedUser ? hydratedUser.name.split(' ')[0] : null,
        login,
        loginAs,
        logout,
        updateProfile,
      };
    },
    [isHydrated, user, login, loginAs, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
