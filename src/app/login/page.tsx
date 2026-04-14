'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function LoginPage() {
  const [keep, setKeep] = useState(true);
  const auth = useAuth();
  const router = useRouter();

  const goHome = () => router.push('/');

  return (
    <div className="bg-card p-4 rounded-lg border border-border max-w-md mx-auto mt-16">
      <div className="max-w-sm mx-auto px-4 py-8 md:py-16">
        <h1 className="text-3xl font-bold mb-4">Entrar</h1>
        <p className="mb-6">Login simulado (mesmo fluxo do app Angular).</p>

        <label className="flex items-center gap-2 my-4 cursor-pointer">
          <input
            type="checkbox"
            checked={keep}
            onChange={(e) => setKeep(e.target.checked)}
            className="w-4 h-4"
          />
          <span>Manter conectado</span>
        </label>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            className="px-5 py-3 btn-primary font-semibold rounded-lg hover:opacity-90 transition-opacity"
            onClick={() => auth.login('admin', keep).then(goHome)}
          >
            Entrar como Admin
          </button>
          <button
            type="button"
            className="px-5 py-3 btn-primary font-semibold rounded-lg hover:opacity-90 transition-opacity"
            onClick={() => auth.login('user', keep).then(goHome)}
          >
            Entrar como Usuário
          </button>
        </div>
      </div>
    </div>
  );
}