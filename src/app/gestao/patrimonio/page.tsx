'use client';

import { DomainWorkspace } from '@/components/domain/DomainWorkspace';

export default function PatrimonioPage() {
  return (
    <DomainWorkspace
      resource="patrimony"
      entityFields={['code', 'name', 'category', 'status', 'location', 'assignedPersonId']}
    />
  );
}
