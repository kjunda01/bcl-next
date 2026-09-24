'use client';

import { DomainWorkspace } from '@/components/domain/DomainWorkspace';

export default function UsuariosPage() {
  return (
    <DomainWorkspace
      resource="users"
      entityFields={['name', 'email', 'roles', 'isActive', 'personId', 'createdAt']}
    />
  );
}
