'use client';

import type { ReactNode } from 'react';
import { can, type Action, type Resource } from '@/core/auth/permissions';
import { useAuth } from '@/contexts/AuthContext';

interface CanProps {
  resource: Resource;
  action?: Action;
  children: ReactNode;
  fallback?: ReactNode;
}

export function Can({ resource, action = 'read', children, fallback = null }: CanProps) {
  const { roles } = useAuth();
  if (!can(roles, resource, action)) {
    return <>{fallback}</>;
  }
  return <>{children}</>;
}
