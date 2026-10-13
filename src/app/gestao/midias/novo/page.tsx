'use client';

import { DomainGuard } from '@/components/domain/DomainGuard';
import { PostEditor } from '@/components/blog/PostEditor';

export default function NovoPostPage() {
  return (
    <DomainGuard resource="media" action="create">
      <PostEditor />
    </DomainGuard>
  );
}
