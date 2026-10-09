'use client';

import { DomainWorkspace } from '@/components/domain/DomainWorkspace';

export default function InstrumentosPage() {
  return (
    <DomainWorkspace
      resource="instruments"
      entityFields={['code', 'name', 'family', 'status', 'location', 'assignedPersonId']}
    />
  );
}
