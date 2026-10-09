'use client';

import { DomainWorkspace } from '@/components/domain/DomainWorkspace';

export default function ApresentacoesGestaoPage() {
  return (
    <DomainWorkspace
      resource="presentations"
      entityFields={['title', 'venue', 'startsAt', 'isPublic', 'status', 'repertoireIds']}
    />
  );
}
