'use client';

import { DomainWorkspace } from '@/components/domain/DomainWorkspace';

export default function MidiasPage() {
  return (
    <DomainWorkspace
      resource="media"
      entityFields={['title', 'slug', 'kind', 'status', 'publishedAt', 'excerpt']}
    />
  );
}
