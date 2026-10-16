'use client';

import { DomainWorkspace } from '@/components/domain/DomainWorkspace';
import { UserApprovals } from '@/components/domain/UserApprovals';

export default function UsuariosPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <UserApprovals />
      <DomainWorkspace resource="users" />
    </div>
  );
}
