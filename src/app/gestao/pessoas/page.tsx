'use client';

import { DomainWorkspace } from '@/components/domain/DomainWorkspace';

export default function PessoasPage() {
  return (
    <DomainWorkspace
      resource="people"
      entityFields={['firstName', 'lastName', 'email', 'phone', 'isStudent', 'isMusician', 'status']}
    />
  );
}
