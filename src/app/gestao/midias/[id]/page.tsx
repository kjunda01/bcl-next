'use client';

import { useParams } from 'next/navigation';
import { DomainGuard } from '@/components/domain/DomainGuard';
import { PostEditor } from '@/components/blog/PostEditor';

export default function EditarPostPage() {
  const params = useParams<{ id: string }>();
  return (
    <DomainGuard resource="media" action="update">
      <PostEditor postId={params?.id} />
    </DomainGuard>
  );
}
