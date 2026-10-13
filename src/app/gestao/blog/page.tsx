'use client';

import { DomainGuard } from '@/components/domain/DomainGuard';
import { BlogLayoutEditor } from '@/components/blog/BlogLayoutEditor';

export default function GestaoBlogPage() {
  return (
    <DomainGuard resource="blogpage" action="update">
      <BlogLayoutEditor />
    </DomainGuard>
  );
}
