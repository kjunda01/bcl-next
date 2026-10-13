'use client';

import { DomainGuard } from '@/components/domain/DomainGuard';
import { HomepageEditor } from '@/components/homepage/HomepageEditor';

export default function GestaoHomePage() {
  return (
    <DomainGuard resource="homepage" action="update">
      <HomepageEditor />
    </DomainGuard>
  );
}
