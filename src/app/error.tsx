'use client';

import { UNDER_CONSTRUCTION_MESSAGE } from '@/lib/userMessages';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <p className="text-[var(--muted)]">{UNDER_CONSTRUCTION_MESSAGE}</p>
      <button type="button" className="btn-primary mt-6 min-h-11" onClick={() => reset()}>
        Tentar de novo
      </button>
    </div>
  );
}
